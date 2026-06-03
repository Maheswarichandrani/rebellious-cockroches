'use server'

import { z } from 'zod'
import { resend } from '@/lib/email/resend'

type State = { ok: boolean; error: string }

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
})

export async function subscribeNewsletter(_prev: State, formData: FormData): Promise<State> {
  const parsed = schema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message }
  }
  const { email } = parsed.data

  // if (!process.env.RESEND_AUDIENCE_ID) {
  //   console.warn('[newsletter] RESEND_AUDIENCE_ID not set')
  //   return { ok: false, error: 'Newsletter not configured.' }
  // }

  try {

    const res = await resend.contacts.create({
      email,
      unsubscribed: false,
      // audienceId: process.env.RESEND_AUDIENCE_ID,
    });


    console.log('[newsletter] contact created:', res)
    return { ok: true, error: '' }
  } catch (err: any) {
    if (err?.statusCode === 409) return { ok: true, error: '' } // already subscribed
    console.error('[newsletter] subscribe failed:', err)
    return { ok: false, error: 'Something went wrong. Try again.' }
  }
}
