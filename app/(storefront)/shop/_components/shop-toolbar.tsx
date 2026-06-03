'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SlidersHorizontal, LayoutGrid, Rows3, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// ── Types & constants ──────────────────────────────────────────────────────────

export type Category = { _id: string; name: string; slug: string | null }

interface ShopToolbarProps {
  totalCount: number
  categories: Category[]
}

const AVAILABILITY_OPTIONS = [
  { value: 'in-stock',     label: 'In Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
] as const

const PRICE_OPTIONS = [
  { value: 'under-500',  label: 'Under ₹500' },
  { value: '500-1000',   label: '₹500 – ₹1,000' },
  { value: 'over-1000',  label: 'Over ₹1,000' },
] as const

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'featured',   label: 'Featured First' },
] as const

// ── Shared filter select ───────────────────────────────────────────────────────

interface FilterSelectProps {
  placeholder: string
  value: string
  onChange: (v: string) => void
  options: readonly { value: string; label: string }[]
  clearLabel?: string
  ghost?: boolean
}

function FilterSelect({
  placeholder,
  value,
  onChange,
  options,
  clearLabel = 'All',
  ghost = false,
}: FilterSelectProps) {
  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => onChange(v === '_clear' ? '' : v)}
    >
      <SelectTrigger
        className={cn(
          ghost
            ? 'h-9 w-auto gap-1 border-0 bg-transparent px-3 text-sm font-medium shadow-none hover:bg-accent focus-visible:ring-0'
            : cn('h-9 w-full', value && 'border-foreground/40')
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {value && <SelectItem value="_clear">{clearLabel}</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ── Main toolbar ───────────────────────────────────────────────────────────────

export function ShopToolbar({ totalCount, categories }: ShopToolbarProps) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  const availability = searchParams.get('availability') ?? ''
  const price        = searchParams.get('price')        ?? ''
  const category     = searchParams.get('category')     ?? ''
  const sort         = searchParams.get('sort')         ?? ''
  const view         = searchParams.get('view')         ?? 'grid'

  const setParam = useCallback(
    (key: string, val: string) => {
      const p = new URLSearchParams(searchParams.toString())
      if (val) p.set(key, val)
      else p.delete(key)
      router.push(`${pathname}?${p.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const clearFilters = useCallback(() => {
    const p = new URLSearchParams()
    if (sort) p.set('sort', sort)
    if (view !== 'grid') p.set('view', view)
    router.push(`${pathname}?${p.toString()}`, { scroll: false })
  }, [router, pathname, sort, view])

  const [sheetOpen, setSheetOpen] = useState(false)

  const activeCount = [availability, price, category].filter(Boolean).length

  const categoryOptions = categories
    .filter((c): c is Category & { slug: string } => c.slug !== null)
    .map((c) => ({ value: c.slug, label: c.name }))

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3">

      {/* ── LEFT: Filters ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">

        {/* Mobile: Sheet trigger */}
        <div className="md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <SlidersHorizontal size={13} />
                Filters
                {activeCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-4 min-w-[16px] rounded-full px-1 text-[10px] leading-none"
                  >
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="text-xs font-semibold uppercase tracking-[0.12em]">
                  Filters
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Availability
                  </Label>
                  <FilterSelect
                    placeholder="All"
                    value={availability}
                    onChange={(v) => { setParam('availability', v); setSheetOpen(false) }}
                    options={AVAILABILITY_OPTIONS}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Price
                  </Label>
                  <FilterSelect
                    placeholder="All Prices"
                    value={price}
                    onChange={(v) => { setParam('price', v); setSheetOpen(false) }}
                    options={PRICE_OPTIONS}
                  />
                </div>

                {/* {categoryOptions.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Category
                    </Label>
                    <FilterSelect
                      placeholder="All Categories"
                      value={category}
                      onChange={(v) => setParam('category', v)}
                      options={categoryOptions}
                      clearLabel="All Categories"
                    />
                  </div>
                )} */}
              </div>

              {activeCount > 0 && (
                <div className="border-t border-border px-5 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={() => { clearFilters(); setSheetOpen(false) }}
                  >
                    <X size={12} />
                    Clear all filters
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop: Inline borderless dropdowns */}
        <div className="hidden items-center md:flex">
          <FilterSelect
            ghost
            placeholder="Availability"
            value={availability}
            onChange={(v) => setParam('availability', v)}
            options={AVAILABILITY_OPTIONS}
          />
          <FilterSelect
            ghost
            placeholder="Price"
            value={price}
            onChange={(v) => setParam('price', v)}
            options={PRICE_OPTIONS}
          />
          {/* {categoryOptions.length > 0 && (
            <FilterSelect
              ghost
              placeholder="Category"
              value={category}
              onChange={(v) => setParam('category', v)}
              options={categoryOptions}
              clearLabel="All Categories"
            />
          )} */}
          {activeCount > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1.5 h-4" />
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1 px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
              >
                <X size={12} />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT: Count + Sort + View toggle ─────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="hidden text-xs tabular-nums text-muted-foreground sm:block">
          {totalCount} {totalCount === 1 ? 'item' : 'items'}
        </span>

        <Separator orientation="vertical" className="hidden h-4 sm:block" />

        <Select
          value={sort || 'newest'}
          onValueChange={(v) => setParam('sort', v === 'newest' ? '' : v)}
        >
          <SelectTrigger className="h-9 w-auto gap-1 border-0 bg-transparent px-3 text-sm font-medium shadow-none hover:bg-accent focus-visible:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-4" />

        {/* Grid / compact view toggle */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8 rounded-r-none', view === 'grid' && 'bg-accent')}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            onClick={() => setParam('view', '')}
          >
            <LayoutGrid size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8 rounded-l-none', view === 'list' && 'bg-accent')}
            aria-label="Compact view"
            aria-pressed={view === 'list'}
            onClick={() => setParam('view', 'list')}
          >
            <Rows3 size={14} />
          </Button>
        </div>
      </div>

    </div>
  )
}
