"use client"

import Link from "next/link"
import Image from "next/image"
import { Dialog } from "@base-ui/react"
import { FaMagnifyingGlass, FaUser, FaBagShopping, FaBars, FaXmark } from "react-icons/fa6"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
]

const CART_COUNT = 0

export function Navbar() {
  return (
    <Dialog.Root>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 h-[5rem] border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-10 flex h-full items-center">

          {/* Logo — left */}
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" className="flex items-center" aria-label="Home">
              <Image
                src="/logo-RC.webp"
                alt="CJP Brand"
                width={120}
                height={48}
                className="h-20 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop links — center, hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons — right */}
          <div className="flex flex-1 items-center justify-end gap-1">

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex text-foreground/60 hover:text-foreground"
              aria-label="Search"
            >
              <FaMagnifyingGlass size={16} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex text-foreground/60 hover:text-foreground"
              aria-label="Account"
            >
              <FaUser size={16} />
            </Button>

            {/* Cart — always visible */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/60 hover:text-foreground"
              aria-label={`Cart${CART_COUNT > 0 ? `, ${CART_COUNT} items` : ""}`}
            >
              <FaBagShopping size={18} />
              {CART_COUNT > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold leading-none text-primary-foreground">
                  {CART_COUNT}
                </span>
              )}
            </Button>

            {/* Mobile menu trigger — Dialog.Trigger renders as <button> */}
            <Dialog.Trigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "md:hidden text-foreground/60 hover:text-foreground"
              )}
              aria-label="Open navigation menu"
            >
              <FaBars size={18} />
            </Dialog.Trigger>

          </div>
        </div>
      </header>

      {/* ── Right-side nav panel ── */}
      <Dialog.Portal>

        <Dialog.Backdrop className="nav-backdrop" />

        <Dialog.Popup className="nav-panel">

          {/* Panel header — height matches navbar */}
          <div className="flex h-[5rem] shrink-0 items-center justify-between border-b border-border px-5">
            <Image
              src="/logo-RC.webp"
              alt="CJP Brand"
              width={100}
              height={40}
              className="h-9 w-auto object-contain"
            />
            <Dialog.Close
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Close navigation menu"
            >
              <FaXmark size={16} />
            </Dialog.Close>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col px-2 py-3" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-4 py-3.5",
                  "text-sm font-medium text-foreground",
                  "border-b border-border/60 last:border-0",
                  "transition-colors duration-150 hover:bg-accent"
                )}
              >
                {link.label}
                <span className="text-xs text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            ))}
          </nav>

          {/* Login — pinned to bottom */}
          <div className="mt-auto border-t border-border p-5">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "w-full justify-center text-xs font-semibold uppercase tracking-wide"
              )}
            >
              Login
            </Link>
          </div>

        </Dialog.Popup>
      </Dialog.Portal>

    </Dialog.Root>
  )
}
