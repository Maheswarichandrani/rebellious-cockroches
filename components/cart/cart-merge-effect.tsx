'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useCartStore } from '@/hooks/use-cart'

// Merges guest cart on sign-in. Runs once per sign-in transition.
export function CartMergeEffect() {
  const { isSignedIn } = useAuth()
  const mergeItems = useCartStore((s) => s.mergeItems)
  const items = useCartStore((s) => s.items)
  const prevSignedIn = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    if (prevSignedIn.current === false && isSignedIn === true && items.length > 0) {
      mergeItems(items)
    }
    prevSignedIn.current = isSignedIn
  }, [isSignedIn, items, mergeItems])

  return null
}
