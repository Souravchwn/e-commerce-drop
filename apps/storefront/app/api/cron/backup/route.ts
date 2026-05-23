import { NextResponse } from 'next/server'
import { createCipheriv, randomBytes } from 'node:crypto'
import { Client } from 'pg'

export const runtime = 'nodejs'
// Allow up to 5 minutes — a full pg dump can take time on free tier
export const maxDuration = 300

// Vercel Cron — runs every Sunday at 03:00 UTC (see vercel.json).
// Dumps all application tables to a JSON archive, AES-256-GCM encrypts the
// payload, and POSTs it to BACKUP_DESTINATION_WEBHOOK (Boundary 3).
//
// The destination webhook is an agency-managed cold-storage endpoint
// (e.g. a private S3 presigned URL refreshed weekly, or a GitHub Gist API call).
//
// To decrypt a backup:
//   const key = Buffer.from(BACKUP_ENCRYPTION_KEY, 'hex')       // 32 bytes
//   const iv  = payload.slice(0, 12)                            // first 12 bytes
//   const tag = payload.slice(12, 28)                           // next 16 bytes
//   const ct  = payload.slice(28)                               // ciphertext
//   const decipher = createDecipheriv('aes-256-gcm', key, iv)
//   decipher.setAuthTag(tag)
//   const plain = Buffer.concat([decipher.update(ct), decipher.final()])
export async function GET(req: Request): Promise<Response> {
  // Verify Vercel cron secret
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const databaseUrl = process.env.DATABASE_URL
  const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY
  const destinationWebhook = process.env.BACKUP_DESTINATION_WEBHOOK

  if (!databaseUrl || !encryptionKey || !destinationWebhook) {
    return NextResponse.json(
      { error: 'Missing BACKUP env vars (DATABASE_URL, BACKUP_ENCRYPTION_KEY, BACKUP_DESTINATION_WEBHOOK)' },
      { status: 500 },
    )
  }

  if (encryptionKey.length !== 64) {
    return NextResponse.json(
      { error: 'BACKUP_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)' },
      { status: 500 },
    )
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()

    // ── 1. Discover all application tables ────────────────────────────────────
    const tablesResult = await client.query<{ table_name: string }>(`
      SELECT table_name
      FROM   information_schema.tables
      WHERE  table_schema = 'public'
        AND  table_type   = 'BASE TABLE'
      ORDER  BY table_name
    `)

    const tables = tablesResult.rows.map((r) => r.table_name)

    // ── 2. Dump all rows from each table ──────────────────────────────────────
    const dump: Record<string, unknown[]> = {}
    for (const table of tables) {
      const res = await client.query(`SELECT * FROM "${table}"`)
      dump[table] = res.rows
    }

    // ── 3. Serialize to JSON ───────────────────────────────────────────────────
    const timestamp = new Date().toISOString()
    const archive   = JSON.stringify({
      _meta: {
        created_at:      timestamp,
        table_count:     tables.length,
        tables,
        source:          'gallery-drop-backup-cron',
      },
      data: dump,
    })

    // ── 4. AES-256-GCM encryption ─────────────────────────────────────────────
    const key       = Buffer.from(encryptionKey, 'hex')
    const iv        = randomBytes(12)                         // 96-bit nonce
    const cipher    = createCipheriv('aes-256-gcm', key, iv)
    const encrypted = Buffer.concat([
      cipher.update(archive, 'utf8'),
      cipher.final(),
    ])
    const authTag = cipher.getAuthTag()

    // Layout: [ iv (12 bytes) | authTag (16 bytes) | ciphertext ]
    const payload = Buffer.concat([iv, authTag, encrypted])

    // ── 5. Ship to cold storage ────────────────────────────────────────────────
    const uploadRes = await fetch(destinationWebhook, {
      method:  'POST',
      headers: {
        'Content-Type':   'application/octet-stream',
        'X-Backup-Date':  timestamp,
        'X-Table-Count':  String(tables.length),
      },
      body: payload,
    })

    if (!uploadRes.ok) {
      const text = await uploadRes.text()
      throw new Error(`Cold storage upload failed: ${uploadRes.status} — ${text}`)
    }

    console.log(`[backup] Weekly backup uploaded. Tables: ${tables.length}, Size: ${payload.length} bytes, Date: ${timestamp}`)

    return NextResponse.json({
      success:     true,
      timestamp,
      tables:      tables.length,
      sizeBytes:   payload.length,
    })
  } catch (err) {
    console.error('[backup] Failed:', err)
    return NextResponse.json(
      { error: String(err) },
      { status: 500 },
    )
  } finally {
    await client.end().catch(() => {})
  }
}
