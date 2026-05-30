import type { Metadata } from 'next'
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartSidebar } from '@/components/cart/cart-sidebar'
import { CartMergeEffect } from '@/components/cart/cart-merge-effect'
import { SanityLive } from '@/sanity/lib/live'

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CJP Brand Store',
  description: 'Premium streetwear — official store',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full antialiased',
        geistSans.variable,
        geistMono.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClerkProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartSidebar />
          <CartMergeEffect />
          <SanityLive />
        </ClerkProvider>
      </body>
    </html>
  )
}
