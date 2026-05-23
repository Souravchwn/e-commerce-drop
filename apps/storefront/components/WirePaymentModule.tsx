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

function BankDetails({ details }: { details: BankTransferInstructions }) {
  const swift = details.financial_addresses?.find((a) => a.swift)?.swift
  const aba   = details.financial_addresses?.find((a) => a.aba)?.aba

  return (
    <div className="border border-stone-200 p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
        <p className="text-sm tracking-widest uppercase text-stone-600">
          Wire Instructions Ready
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm">
        <Field label="Reference Code" value={details.reference} mono />
        <Field label="Amount Due" value={formatUSD(details.amount_remaining)} />

        {swift && (
          <>
            <Field label="Bank Name"        value={swift.bank_name} />
            <Field label="Account Number"   value={swift.account_number} mono />
            <Field label="SWIFT / BIC"      value={swift.swift_code} mono />
            <Field label="Bank Country"     value={swift.country} />
          </>
        )}

        {aba && !swift && (
          <>
            <Field label="Bank Name"        value={aba.bank_name} />
            <Field label="Account Number"   value={aba.account_number} mono />
            <Field label="Routing Number"   value={aba.routing_number} mono />
          </>
        )}
      </div>

      <div className="border-t border-stone-100 pt-4">
        <p className="text-xs text-stone-500 leading-relaxed">
          Please include the <strong>Reference Code</strong> exactly as shown in your
          wire transfer memo. Settlement takes 2–3 business days. Your item is
          reserved for 48 hours. You will receive a confirmation email once
          payment clears.
        </p>
      </div>

      {details.hosted_instructions_url && (
        <a
          href={details.hosted_instructions_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline text-stone-500 hover:text-stone-900 transition-colors"
        >
          View full instructions on Stripe →
        </a>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400">{label}</span>
      <span className={`text-stone-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

export default function WirePaymentModule({
  cartId,
  productId,
  amountCents,
  customerEmail,
}: WirePaymentModuleProps) {
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [details,  setDetails]  = useState<BankTransferInstructions | null>(null)

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
    <div className="flex flex-col gap-8">
      {/* Header panel */}
      <div className="border border-stone-200 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-stone-400">Payment Method</p>
            <p className="mt-1 text-stone-900 font-light text-lg">International Bank Wire</p>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-[0.3em] uppercase text-stone-400">Transaction Fee</p>
            <p className="mt-1 text-stone-900 font-light">~$8 flat</p>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
          <span className="text-sm text-stone-600">Order Total</span>
          <span className="text-xl font-light tabular-nums text-stone-900">
            {formatUSD(amountCents)}
          </span>
        </div>

        <div className="bg-stone-50 p-4 text-xs text-stone-500 leading-relaxed">
          For purchases over $5,000 we process via international SWIFT wire transfer.
          Your item will be reserved for 48 hours while your wire clears. Card and
          digital wallet payments are not available at this price point.
        </div>
      </div>

      {/* Bank details (shown after requesting) */}
      {details ? (
        <BankDetails details={details} />
      ) : (
        <>
          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}

          <button
            onClick={handleRequestWire}
            disabled={loading}
            className="w-full bg-stone-900 text-white text-sm tracking-widest uppercase
                       py-4 px-8 hover:bg-stone-700 transition-colors duration-200
                       disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating Wire Instructions…' : 'Request International Bank Wire'}
          </button>

          <p className="text-center text-xs text-stone-400">
            Settlement in 2–3 business days · Item held for 48 hours
          </p>
        </>
      )}
    </div>
  )
}
