import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartSidebar } from '@/components/cart/cart-sidebar'
import { CartMergeEffect } from '@/components/cart/cart-merge-effect'
import { AnnouncementBanner } from '@/components/layout/announcement-banner'
import { PageTransition } from '@/components/layout/page-transition'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CartSidebar />
      <CartMergeEffect />
    </>
  )
}
