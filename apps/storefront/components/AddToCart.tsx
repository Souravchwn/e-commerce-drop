'use client'

import DropCountdown from './DropCountdown'

export default function AddToCart({
  dropDate,
  productId,
}: {
  dropDate:  string
  productId: string
}) {
  return (
    <DropCountdown
      dropDate={dropDate}
      productId={productId}
      onAddToCart={(id) => {
        window.location.href = `/cart?add=${id}`
      }}
    />
  )
}
