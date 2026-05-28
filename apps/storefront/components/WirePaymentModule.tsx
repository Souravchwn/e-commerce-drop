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
    style:    'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="py-3 border-b border-[#d4d4d4] flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.12em] text-[#767676]">{label}</span>
      <span className={`text-[13px] text-black ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function BankDetails({ details }: { details: BankTransferInstructions }) {
  const swift = details.financial_addresses?.find((a) => a.swift)?.swift
  const aba   = details.financial_addresses?.find((a) => a.aba)?.aba

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-2 py-3 border-b border-[#d4d4d4]">
        <span className="inline-block w-[6px] h-[6px] bg-black" />
        <p className="text-[11px] uppercase tracking-[0.12em] text-black">
          Wire Instructions Ready
        </p>
      </div>

      <Field label="Reference Code" value={details.reference} mono />
      <Field label="Amount Due"     value={formatUSD(details.amount_remaining)} />

      {swift && (
        <>
          <Field label="Bank Name"      value={swift.bank_name} />
          <Field label="Account Number" value={swift.account_number} mono />
          <Field label="SWIFT / BIC"    value={swift.bic} mono />
          <Field label="Bank Country"   value={swift.country} />
        </>
      )}

      {aba && !swift && (
        <>
          <Field label="Bank Name"      value={aba.bank_name} />
          <Field label="Account Number" value={aba.account_number} mono />
          <Field label="Routing Number" value={aba.routing_number} mono />
        </>
      )}

      <p className="text-[11px] text-[#767676] leading-relaxed pt-4">
        Include the <strong className="text-black">Reference Code</strong> exactly as shown in your
        wire memo. Settlement takes 2–3 business days. Item reserved for 48 hours.
      </p>

      {details.hosted_instructions_url && (
        <a
          href={details.hosted_instructions_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-[11px] uppercase tracking-[0.1em] text-[#767676] hover:text-black transition-colors underline underline-offset-2"
        >
          View full instructions on Stripe →
        </a>
      )}
    </div>
  )
}

export default function WirePaymentModule({
  cartId,
  productId,
  amountCents,
  customerEmail,
}: WirePaymentModuleProps) {
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
        body: JSON.stringify({ cartId, productId, amountCents, customerEmail }),
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
    <div className="flex flex-col gap-0">
      {/* Summary row */}
      <div className="flex justify-between items-baseline py-3 border-b border-[#d4d4d4]">
        <span className="text-[11px] uppercase tracking-[0.1em] text-[#767676]">Payment Method</span>
        <span className="text-[13px] text-black">International Bank Wire</span>
      </div>
      <div className="flex justify-between items-baseline py-3 border-b border-[#d4d4d4]">
        <span className="text-[11px] uppercase tracking-[0.1em] text-[#767676]">Transaction Fee</span>
        <span className="text-[13px] text-black">~$8 flat</span>
      </div>
      <div className="flex justify-between items-baseline py-3 border-b border-[#d4d4d4]">
        <span className="text-[11px] uppercase tracking-[0.1em] text-[#767676]">Order Total</span>
        <span className="text-[20px] text-black tabular-nums">{formatUSD(amountCents)}</span>
      </div>

      <p className="text-[11px] text-[#767676] leading-relaxed py-4 border-b border-[#d4d4d4]">
        Purchases over $5,000 are processed via international SWIFT wire transfer.
        Your item is reserved for 48 hours while the wire clears. Card and digital
        wallet payments are not available at this price point.
      </p>

      {details ? (
        <div className="pt-4">
          <BankDetails details={details} />
        </div>
      ) : (
        <div className="pt-6 flex flex-col gap-3">
          {error && (
            <p className="text-[13px] text-[#cc0000] text-center" role="alert">
              {error}
            </p>
          )}

          <button
            onClick={handleRequestWire}
            disabled={loading}
            className="w-full bg-black text-white text-[11px] tracking-[0.15em] uppercase py-5 px-4 hover:bg-[#333] transition-colors disabled:bg-[#f5f5f5] disabled:text-[#767676] disabled:cursor-not-allowed"
          >
            {loading ? 'Generating Wire Instructions…' : 'Request Bank Wire Details'}
          </button>

          <p className="text-center text-[11px] text-[#767676]">
            Settlement 2–3 business days · Item held 48 hours
          </p>
        </div>
      )}
    </div>
  )
}
