"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Dialog } from "radix-ui"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { FaMagnifyingGlass, FaUser, FaBagShopping, FaBars, FaXmark } from "react-icons/fa6"
import { Show, UserButton, SignInButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { useCartStore, selectCartItemCount } from "@/hooks/use-cart"

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
]

function NavbarContent() {
  const iconColor = "text-foreground/60 hover:text-foreground"
  const linkColor = "text-muted-foreground hover:text-foreground"
  const cartCount = useCartStore(selectCartItemCount)
  const openCart = useCartStore((s) => s.openCart)

  return (
    <div className="page-container flex h-full items-center">
      {/* Logo — left */}
      <div className="flex flex-1 items-center justify-start">
        <Link href="/" className="flex items-center" aria-label="Home">
          <Image
            src="/logo-RC.webp"
            alt="CJP Brand"
            width={120}
            height={48}
            className="h-7 md:h-8 w-auto object-contain transition-all"
            priority
          />
        </Link>
      </div>

      {/* Desktop links — center */}
      <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-150",
              linkColor
            )}
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
          className={cn("hidden md:inline-flex", iconColor)}
          aria-label="Search"
        >
          <FaMagnifyingGlass size={16} />
        </Button>

        {/* Account icon — desktop */}
        <div className="hidden md:flex items-center justify-center h-9 w-9">
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7",
                  userButtonTrigger: "focus:shadow-none",
                },
              }}
            />
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="icon" className={iconColor} aria-label="Sign in">
                <FaUser size={16} />
              </Button>
            </SignInButton>
          </Show>
        </div>

        {/* Cart — always visible */}
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", iconColor)}
          onClick={openCart}
          aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
        >
          <FaBagShopping size={18} />
          {cartCount > 0 && (
            <span className={cn(
              "absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold leading-none",
              "bg-primary text-primary-foreground"
            )}>
              {cartCount}
            </span>
          )}
        </Button>

        {/* Mobile menu trigger */}
        <Dialog.Trigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "md:hidden", iconColor
          )}
          aria-label="Open navigation menu"
        >
          <FaBars size={18} />
        </Dialog.Trigger>
      </div>
    </div>
  )
}

export function Navbar() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    setIsAtTop(latest <= 150)
    if (latest > 150 && latest > previous) {
      setHidden(true)
    } else if (latest < previous) {
      setHidden(false)
    }
  })

  return (
    <Dialog.Root>

      {/* Absolute transparent header (hero overlay) */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-0 inset-x-0 z-50 h-14 md:h-16 bg-transparent border-transparent"
      >
        <NavbarContent />
      </motion.header>

      {/* Fixed sticky header (appears on scroll up) */}
      <motion.header
        initial={{ y: "-100%" }}
        animate={{ y: (!isAtTop && !hidden) ? 0 : "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 inset-x-0 z-50 h-14 md:h-16 border-b border-border bg-background/95 backdrop-blur-md shadow-sm"
      >
        <NavbarContent />
      </motion.header>

      {/* Right-side mobile nav panel */}
      <Dialog.Portal>

        <Dialog.Overlay className="nav-backdrop" />

        <Dialog.Content className="nav-panel">

          <div className="flex h-14 md:h-16 shrink-0 items-center justify-between border-b border-border px-5">
            <Image
              src="/logo-RC.webp"
              alt="CJP Brand"
              width={100}
              height={40}
              className="h-7 md:h-8 w-auto object-contain"
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

          {/* Account — pinned to bottom */}
          <div className="mt-auto border-t border-border p-5 flex items-center gap-3">
            <Show when="signed-in">
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
              <Link
                href="/account"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "flex-1 justify-center text-xs font-semibold uppercase tracking-wide"
                )}
              >
                My Orders
              </Link>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "w-full justify-center text-xs font-semibold uppercase tracking-wide"
                  )}
                >
                  Login
                </button>
              </SignInButton>
            </Show>
          </div>

        </Dialog.Content>
      </Dialog.Portal>

    </Dialog.Root>
  )
}
