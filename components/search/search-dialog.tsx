'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Dialog } from 'radix-ui'
import { motion } from 'framer-motion'
import { Search, X, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { client } from '@/sanity/lib/client'
import { PRODUCT_SEARCH_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { formatPrice } from '@/lib/formatters'
import { useDebounce } from '@/hooks/use-debounce'

// ── Types ──────────────────────────────────────────────────────────────────────

type SearchProduct = {
  _id: string
  name: string | null
  slug: string | null
  price: number
  compareAtPrice: number | null
  image: { _type: string; asset: { _ref: string; _type: string } | null } | null
}

// ── Recent searches helpers ────────────────────────────────────────────────────

const LS_KEY = 'rc-recent-searches'
const MAX_RECENT = 5

function loadRecent(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function persistRecent(term: string, current: string[]): string[] {
  const t = term.trim().toLowerCase()
  if (!t) return current
  const next = [t, ...current.filter(s => s !== t)].slice(0, MAX_RECENT)
  localStorage.setItem(LS_KEY, JSON.stringify(next))
  return next
}

// ── Skeleton rows ──────────────────────────────────────────────────────────────

function ResultSkeletons() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
          <Skeleton className="h-16 w-12 shrink-0 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-2/3 rounded" />
            <Skeleton className="h-3 w-1/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery]               = useState('')
  const [results, setResults]           = useState<SearchProduct[]>([])
  const [isLoading, setIsLoading]       = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query.trim(), 300)

  // Load recents on open; reset state on close
  useEffect(() => {
    if (open) {
      setRecentSearches(loadRecent())
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  // Fetch products on debounced query change
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    client
      .fetch<SearchProduct[]>(PRODUCT_SEARCH_QUERY, { q: `${debouncedQuery}*` })
      .then(data => {
        if (!cancelled) {
          setResults(data ?? [])
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [debouncedQuery])

  const saveAndClose = useCallback(() => {
    if (debouncedQuery) {
      setRecentSearches(prev => persistRecent(debouncedQuery, prev))
    }
    onOpenChange(false)
  }, [debouncedQuery, onOpenChange])

  const clearRecents = () => {
    setRecentSearches([])
    localStorage.removeItem(LS_KEY)
  }

  const showRecents  = !query && recentSearches.length > 0
  const showResults  = !!debouncedQuery
  const showEmpty    = showResults && !isLoading && results.length === 0
  const showFooter   = showResults && !isLoading && results.length > 0

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>

        {/* Backdrop */}
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </Dialog.Overlay>

        {/* Panel */}
        <Dialog.Content asChild>
          <motion.div
            className={cn(
              'fixed left-1/2 top-[10%] z-50',
              'mx-4 w-[calc(100%-2rem)] max-w-[680px]',
              '-translate-x-1/2 overflow-hidden rounded-xl',
              'bg-background shadow-2xl ring-1 ring-border/50'
            )}
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          >

            <Dialog.Title className="sr-only">Search products</Dialog.Title>

            {/* Search input row */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search size={16} className="shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && debouncedQuery) {
                    setRecentSearches(prev => persistRecent(debouncedQuery, prev))
                  }
                }}
                placeholder="Search products…"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                autoComplete="off"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuery('')}
                  aria-label="Clear search input"
                >
                  <X size={13} />
                </Button>
              )}
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Close search"
                >
                  <X size={16} strokeWidth={1.75} />
                </Button>
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto">

              {/* Recent searches */}
              {showRecents && (
                <div className="px-4 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Recent searches
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={clearRecents}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(term => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-foreground transition-colors hover:bg-accent"
                      >
                        <Clock size={11} className="shrink-0 text-muted-foreground" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product results */}
              {showResults && (
                <div className="px-4 py-4">
                  <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Products
                  </span>

                  {isLoading && <ResultSkeletons />}

                  {showEmpty && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No products found for &ldquo;{debouncedQuery}&rdquo;
                    </p>
                  )}

                  {!isLoading && results.map(product => {
                    const imageUrl = product.image?.asset
                      ? urlFor(product.image).width(80).height(107).fit('crop').auto('format').url()
                      : null

                    return (
                      <Link
                        key={product._id}
                        href={`/shop/${product.slug}`}
                        onClick={saveAndClose}
                        className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product.name ?? ''}
                              fill
                              className="object-cover object-top"
                              sizes="48px"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        <ArrowRight
                          size={14}
                          className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Empty state — no query, no recents */}
              {!showRecents && !showResults && (
                <div className="px-4 py-10 text-center">
                  <Search size={20} className="mx-auto mb-3 text-muted-foreground/40" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">Start typing to search products…</p>
                </div>
              )}
            </div>

            {/* View all footer */}
            {showFooter && (
              <div className="border-t border-border px-4 py-3">
                <Link
                  href="/shop"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-center gap-1.5 rounded-md py-1 text-xs font-semibold uppercase tracking-[0.1em] text-foreground transition-colors hover:text-foreground/60"
                >
                  View all products
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}

          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
