'use client'

import { useRef, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { type UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { type CheckoutFormData } from '@/lib/checkout-schema'

interface GeoapifyFeature {
  properties: {
    formatted:     string
    address_line1: string
    city?:         string
    county?:       string
    state?:        string
    postcode?:     string
    country?:      string
  }
}

interface Props {
  form: UseFormReturn<CheckoutFormData>
}

export function AddressSearchField({ form }: Props) {
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([])
  const [isSearching, setIsSearching]  = useState(false)
  const [open, setOpen]                = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef  = useRef<HTMLDivElement>(null)

  async function fetchSuggestions(query: string) {
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
    if (!apiKey) return

    setIsSearching(true)
    try {
      const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete')
      url.searchParams.set('text',   query)
      url.searchParams.set('apiKey', apiKey)
      url.searchParams.set('filter', 'countrycode:in')
      url.searchParams.set('limit',  '5')

      const res  = await fetch(url.toString())
      if (!res.ok) return
      const data = await res.json()
      // API returns GeoJSON FeatureCollection — features[].properties
      const features: GeoapifyFeature[] = data.features ?? []
      setSuggestions(features)
      setOpen(features.length > 0)
    } catch {
      // Silently fall back to plain text input
    } finally {
      setIsSearching(false)
    }
  }

  function handleInputChange(value: string) {
    form.setValue('addressLine1', value, { shouldValidate: false })

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300)
  }

  function handleSelect(feature: GeoapifyFeature) {
    const p = feature.properties
    form.setValue('addressLine1', p.address_line1 || p.formatted.split(',')[0] || '', { shouldValidate: true })
    form.setValue('city',    p.city ?? p.county ?? '', { shouldValidate: true })
    form.setValue('state',   p.state ?? '',             { shouldValidate: true })
    form.setValue('pincode', p.postcode ?? '',           { shouldValidate: true })
    form.setValue('country', 'India',                   { shouldValidate: true })
    setSuggestions([])
    setOpen(false)
  }

  function handleBlur() {
    // Small delay so clicks on suggestions register
    setTimeout(() => setOpen(false), 150)
  }

  return (
    <FormField
      control={form.control}
      name="addressLine1"
      render={({ field }) => (
        <FormItem ref={wrapperRef} className="relative">
          <FormLabel>Address</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                placeholder="Start typing your address…"
                autoComplete="off"
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleBlur}
                onFocus={() => suggestions.length > 0 && setOpen(true)}
                className="pr-9"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {isSearching
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Search size={15} />
                }
              </div>
            </div>
          </FormControl>
          <FormMessage />

          {open && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover shadow-md text-sm">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className={cn(
                      'w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors',
                      'line-clamp-1'
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault() // Prevent blur firing before click
                      handleSelect(s)
                    }}
                  >
                    {s.properties.formatted}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </FormItem>
      )}
    />
  )
}
