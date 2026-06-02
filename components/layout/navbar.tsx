"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Dialog } from "radix-ui"
import { Search, User, ShoppingBag, Menu, X } from "lucide-react"
import { Show, UserButton, SignInButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { useCartStore, selectCartItemCount } from "@/hooks/use-cart"
import { SearchDialog } from "@/components/search/search-dialog"

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
]

const ICON_CLS = "text-foreground/60 hover:text-foreground transition-colors"
const LINK_CLS = "text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground transition-colors duration-150 hover:text-foreground"

function NavbarContent() {
  const cartCount  = useCartStore(selectCartItemCount)
  const openCart   = useCartStore((s) => s.openCart)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <div className="page-container flex h-full items-center">

        {/* Logo — left */}
        <div className="flex flex-1 items-center justify-start">
          <Link href="/" className="flex items-center" aria-label="Home">
            <Image
              src="/logo-RC.webp"
              alt="CJP Brand"
              width={120}
              height={48}
              className="h-7 md:h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop links — center */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={LINK_CLS}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Icons — right */}
        <div className="flex flex-1 items-center justify-end gap-0.5">

          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(ICON_CLS)}
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={17} strokeWidth={1.75} />
          </Button>

          {/* Account */}
          <div className="flex items-center justify-center h-9 w-9">
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-7 w-7",
                    userButtonTrigger: "focus:shadow-none",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Orders"
                    labelIcon={<ShoppingBag size={12} />}
                    href="/account"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" size="icon" className={ICON_CLS} aria-label="Sign in">
                  <User size={17} strokeWidth={1.75} />
                </Button>
              </SignInButton>
            </Show>
          </div>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className={cn("relative", ICON_CLS)}
            onClick={openCart}
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
          >
            <ShoppingBag size={18} strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold leading-none text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>

          {/* Mobile menu trigger */}
          <Dialog.Trigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "md:hidden",
              ICON_CLS
            )}
            aria-label="Open navigation menu"
          >
            <Menu size={18} strokeWidth={1.75} />
          </Dialog.Trigger>

        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}

export function Navbar() {
  return (
    <Dialog.Root>

      <header className="sticky top-0 inset-x-0 z-50 h-14 md:h-16 bg-background border-b border-border">
        <NavbarContent />
      </header>

      {/* Mobile nav panel */}
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
              <X size={16} strokeWidth={1.75} />
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
                  "border-b border-border/60",
                  "transition-colors duration-150 hover:bg-accent"
                )}
              >
                {link.label}
                <span className="text-xs text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            ))}
            <Show when="signed-in">
              <Link
                href="/account"
                className={cn(
                  "group flex items-center justify-between rounded-lg px-4 py-3.5",
                  "text-sm font-medium text-foreground",
                  "transition-colors duration-150 hover:bg-accent"
                )}
              >
                Account
                <span className="text-xs text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </Show>
          </nav>

          {/* Auth — pinned to bottom */}
          <div className="mt-auto flex items-center justify-center border-t border-border p-5">
            <Show when="signed-in">
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
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
