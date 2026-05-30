import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/components'
import { resend } from '@/lib/email/resend'
import { contactSchema } from '@/lib/contact-schema'
import { ContactReceived } from '@/lib/email/templates/contact-received'
import { ContactAdmin } from '@/lib/email/templates/contact-admin'

// Simple in-memory rate limit: max 3 submissions per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 3

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }

  if (entry.count >= MAX_REQUESTS) return true

  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse + validate
    const body = await req.json()
    const result = contactSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid form data.', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, phone, message } = result.data

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@cjpbrand.in'
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@cjpbrand.in'

    // Send both emails in parallel
    const [customerEmail, adminEmailResult] = await Promise.all([
      resend.emails.send({
        from: `CJP Brand Store <${fromEmail}>`,
        to: email,
        replyTo: adminEmail,
        subject: "We received your message — CJP Brand Store",
        html: await render(ContactReceived({ name, message })),
      }),
      resend.emails.send({
        from: `CJP Brand Store <${fromEmail}>`,
        to: adminEmail,
        replyTo: email,
        subject: `New enquiry from ${name}`,
        html: await render(ContactAdmin({ name, email, phone: phone || undefined, message })),
      }),
    ])

    if (customerEmail.error || adminEmailResult.error) {
      console.error('Resend error:', customerEmail.error ?? adminEmailResult.error)
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
