import { CartMergeEffect } from '@/components/cart/cart-merge-effect'

export default function CheckoutGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div data-checkout className="min-h-screen bg-background">
      {children}
      <CartMergeEffect />
    </div>
  )
}
