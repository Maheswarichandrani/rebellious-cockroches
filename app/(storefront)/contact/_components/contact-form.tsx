'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiAlertCircle, FiSend } from 'react-icons/fi'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { contactSchema, type ContactFormData } from '@/lib/contact-schema'
import { cn } from '@/lib/utils'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  })

  async function onSubmit(data: ContactFormData) {
    setFormState('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setErrorMessage(json.error ?? 'Something went wrong.')
        setFormState('error')
        return
      }

      setFormState('success')
    } catch {
      setErrorMessage('Network error. Check your connection and try again.')
      setFormState('error')
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center py-10 text-center gap-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary"
        >
          <FiCheck className="text-primary-foreground" size={28} />
        </motion.div>

        <div>
          <p className="font-display text-xl font-extrabold tracking-[-0.02em] text-foreground">
            Message sent!
          </p>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            We got your message and will reply within 24&nbsp;hours.
            Check your inbox for a confirmation.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs font-semibold uppercase tracking-wide"
          onClick={() => {
            form.reset()
            setFormState('idle')
          }}
        >
          Send another message
        </Button>
      </motion.div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* Name + Email — side by side on desktop */}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your full name"
                    className="h-11 bg-background"
                    disabled={formState === 'submitting'}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 bg-background"
                    disabled={formState === 'submitting'}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Phone — optional */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Phone{' '}
                <span className="normal-case font-normal tracking-normal text-muted-foreground/60">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="h-11 bg-background"
                  disabled={formState === 'submitting'}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Message */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Message <span className="text-destructive">*</span>
                </FormLabel>
                <span className="text-[11px] text-muted-foreground/60 tabular-nums">
                  {field.value.length}/2000
                </span>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Tell us how we can help..."
                  className="min-h-[140px] resize-none bg-background"
                  disabled={formState === 'submitting'}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Error banner */}
        <AnimatePresence>
          {formState === 'error' && errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
            >
              <FiAlertCircle size={15} className="mt-0.5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={formState === 'submitting'}
          className="h-12 gap-2 text-xs font-bold uppercase tracking-[0.1em]"
        >
          {formState === 'submitting' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Sending...
            </>
          ) : (
            <>
              <FiSend size={14} />
              Send Message
            </>
          )}
        </Button>

      </form>
    </Form>
  )
}
