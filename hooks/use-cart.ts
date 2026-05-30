'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  productSlug: string
  name: string
  colorVariantSlug: string
  colorVariantName: string
  size: string
  qty: number
  priceSnapshot: number
  compareAtPriceSnapshot?: number
  imageSnapshot: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string, colorVariantSlug: string, size: string) => void
  updateQty: (productId: string, colorVariantSlug: string, size: string, qty: number) => void
  clearCart: () => void
  mergeItems: (incoming: CartItem[]) => void
  openCart: () => void
  closeCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId &&
              i.colorVariantSlug === item.colorVariantSlug &&
              i.size === item.size
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId &&
                i.colorVariantSlug === item.colorVariantSlug &&
                i.size === item.size
                  ? { ...i, qty: i.qty + item.qty }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem: (productId, colorVariantSlug, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.colorVariantSlug === colorVariantSlug &&
                i.size === size
              )
          ),
        }))
      },

      updateQty: (productId, colorVariantSlug, size, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, colorVariantSlug, size)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId &&
            i.colorVariantSlug === colorVariantSlug &&
            i.size === size
              ? { ...i, qty }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      mergeItems: (incoming) => {
        set((state) => {
          const merged = [...state.items]
          for (const inc of incoming) {
            const idx = merged.findIndex(
              (i) =>
                i.productId === inc.productId &&
                i.colorVariantSlug === inc.colorVariantSlug &&
                i.size === inc.size
            )
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], qty: merged[idx].qty + inc.qty }
            } else {
              merged.push(inc)
            }
          }
          return { items: merged }
        })
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'cjp-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

export const selectCartTotal = (state: CartStore) =>
  state.items.reduce((sum, i) => sum + i.priceSnapshot * i.qty, 0)

export const selectCartItemCount = (state: CartStore) =>
  state.items.reduce((sum, i) => sum + i.qty, 0)
