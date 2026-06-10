import type { SanityProductListItem } from '../types'

export interface DropSeason {
  key:      string   // e.g. "ss2026"
  label:    string   // e.g. "Spring/Summer 2026"
  year:     number
  half:     'ss' | 'fw'
  products: SanityProductListItem[]
}

/** Derives a season key+label from a dropDate ISO string. */
export function dateToSeason(iso: string): { key: string; label: string; year: number; half: 'ss' | 'fw' } {
  const d    = new Date(iso)
  const year = d.getUTCFullYear()
  const mon  = d.getUTCMonth() + 1           // 1-12
  const half = mon >= 7 ? 'fw' : 'ss'
  const key  = `${half}${year}`
  const label = half === 'ss' ? `Spring/Summer ${year}` : `Fall/Winter ${year}`
  return { key, label, year, half }
}

/** Groups an array of products into seasons, newest first. */
export function groupBySeasons(products: SanityProductListItem[]): DropSeason[] {
  const map = new Map<string, DropSeason>()

  for (const p of products) {
    if (!p.dropDate) continue
    const { key, label, year, half } = dateToSeason(p.dropDate)
    if (!map.has(key)) {
      map.set(key, { key, label, year, half, products: [] })
    }
    map.get(key)!.products.push(p)
  }

  // Sort seasons newest-first
  return Array.from(map.values()).sort((a, b) =>
    a.year !== b.year ? b.year - a.year : (b.half === 'fw' ? 1 : -1),
  )
}
