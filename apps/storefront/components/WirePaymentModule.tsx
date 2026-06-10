'use client'

import { useState } from 'react'
import type { WireIntentResponse, BankTransferInstructions } from '../types'

interface WirePaymentModuleProps {
  cartId:        string
  productId:     string
  amountCents:   number
  customerEmail: string
}

function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  }).format(cents / 100)
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-s-border last:border-b-0">
      <span className="text-2xs uppercase tracking-widest text-s-muted font-semibold flex-shrink-0">{label}</span>
      <span className={`text-sm text-s-fg text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function BankDetails({ details }: { details: BankTransferInstructions }) {
  const swift = details.financial_addresses?.find((a) => a.swift)?.swift
  const aba   = details.financial_addresses?.find((a) => a.aba)?.aba

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 bg-s-red rounded-full animate-pulse-dot" />
        <p className="text-xs font-semibold uppercase tracking-widest text-s-red">Wire Instructions Ready</p>
      </div>

      <div className="border border-s-border mb-4">
        <Row label="Reference"  value={details.reference}                mono />
        <Row label="Amount Due" value={formatUSD(details.amount_remaining)} />
        {swift && <>
          <Row label="Bank"    value={swift.bank_name}      />
          <Row label="Account" value={swift.account_number} mono />
          <Row label="SWIFT"   value={swift.swift_code}     mono />
          <Row label="Country" value={swift.country}        />
        </>}
        {aba && !swift && <>
          <Row label="Bank"    value={aba.bank_name}      />
          <Row label="Account" value={aba.account_number} mono />
          <Row label="Routing" value={aba.routing_number} mono />
        </>}
      </div>

      <p className="text-xs text-s-muted leading-relaxed mb-3">
        Include the <strong className="text-s-fg font-medium">Reference Code</strong> exactly as shown in your wire memo.
        Settlement 2–3 business days · Item held 48 hours.
      </p>

      {details.hosted_instructions_url && (
        <a
          href={details.hosted_instructions_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-s-muted hover:text-s-fg underline transition-colors"
        >
          View full instructions on Stripe →
        </a>
      )}
    </div>
  )
}

export default function WirePaymentModule({ cartId, productId, amountCents, customerEmail }: WirePaymentModuleProps) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [details, setDetails] = useState<BankTransferInstructions | null>(null)

  async function handleRequestWire() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/wire-intent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cartId, productId, amountCents, customerEmail }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Server error (${res.status})`)
      }
      const data: WireIntentResponse = await res.json()
      setDetails(data.bankDetails)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Summary */}
      <div className="border border-s-border mb-5">
        <Row label="Method"  value="International Bank Wire" />
        <Row label="Fee"     value="~$8 flat" />
        <Row label="Total"   value={formatUSD(amountCents)} />
      </div>

      <p className="text-xs text-s-muted leading-relaxed mb-5">
        Purchases over $5,000 are processed via SWIFT wire transfer.
        Your item is reserved for 48 hours while the wire clears.
      </p>

      {details ? (
        <BankDetails details={details} />
      ) : (
        <>
          {error && (
            <p className="text-xs text-s-red mb-3" role="alert">{error}</p>
          )}
          <button
            onClick={handleRequestWire}
            disabled={loading}
            className="w-full bg-s-fg text-s-bg text-xs font-semibold uppercase tracking-widest py-4 hover:bg-s-red hover:text-white transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating Instructions…' : 'Request Bank Wire Details'}
          </button>
          <p className="text-center text-2xs text-s-muted mt-2">
            Settlement 2–3 business days · Item held 48 hours
          </p>
        </>
      )}
    </div>
  )
}
