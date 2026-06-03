'use client'

import { useActionState } from 'react'
import { FaArrowRight } from 'react-icons/fa6'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { subscribeNewsletter } from '@/app/(storefront)/actions/newsletter'

const initialState = { ok: false, error: '' }

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, initialState)

  if (state.ok) {
    return <p className="text-sm font-medium text-foreground">You&apos;re subscribed!</p>
  }

  return (
    <form action={action} className="relative flex w-full items-center">
      <Input
        type="email"
        name="email"
        placeholder="Email address"
        required
        disabled={pending}
        className="h-12 rounded-full border-input bg-transparent px-6 pr-14 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/20"
        aria-describedby={state.error ? 'newsletter-error' : undefined}
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        disabled={pending}
        aria-label="Subscribe"
        className="absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
      >
        <FaArrowRight size={14} />
      </Button>
      {state.error && (
        <p id="newsletter-error" className="absolute -bottom-5 left-0 text-xs text-destructive">
          {state.error}
        </p>
      )}
    </form>
  )
}
