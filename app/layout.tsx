import type { Metadata } from 'next'
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { cn } from '@/lib/utils'

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
      data-scroll-behavior="smooth"
      className={cn(
        'h-full antialiased',
        geistSans.variable,
        geistMono.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
