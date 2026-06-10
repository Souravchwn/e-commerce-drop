'use client'

import { useTransition } from 'react'
import { addToCartAction } from '../app/actions'
import DropCountdown from './DropCountdown'

export default function AddToCart({
  dropDate,
  productId,
}: {
  dropDate:  string
  productId: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleAddToCart(id: string) {
    startTransition(() => {
      addToCartAction(id)
    })
  }

  return (
    <DropCountdown
      dropDate={dropDate}
      productId={productId}
      onAddToCart={handleAddToCart}
      isPending={isPending}
    />
  )
}
