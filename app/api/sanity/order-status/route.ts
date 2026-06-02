import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { render } from '@react-email/components'
import { resend } from '@/lib/email/resend'
import { OrderStatusUpdate } from '@/lib/email/templates/order-status-update'

// Statuses that warrant a customer email
const NOTIFIABLE_STATUSES = new Set(['processing', 'shipped', 'delivered', 'cancelled'])

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    const a = Buffer.from(signature, 'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[sanity-webhook] SANITY_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const rawBody  = await req.text()
  const signature = req.headers.get('sanity-webhook-signature') ?? ''

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status, previousStatus, orderNumber, customerInfo } = body ?? {}

  // Skip if status unchanged or not a notifiable transition
  if (!status || status === previousStatus || !NOTIFIABLE_STATUSES.has(status)) {
    return NextResponse.json({ ok: true })
  }

  // Skip if no customer email
  if (!customerInfo?.email || !orderNumber) {
    return NextResponse.json({ ok: true })
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@cjpbrand.in'
  const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL ?? ''

  const SUBJECTS: Record<string, string> = {
    processing: `Your order ${orderNumber} is being prepared`,
    shipped:    `Your order ${orderNumber} is on its way!`,
    delivered:  `Your order ${orderNumber} has been delivered`,
    cancelled:  `Your order ${orderNumber} has been cancelled`,
  }

  try {
    await resend.emails.send({
      from:    `CJP Brand Store <${fromEmail}>`,
      to:      customerInfo.email,
      subject: SUBJECTS[status] ?? `Order ${orderNumber} update`,
      html:    await render(OrderStatusUpdate({
        orderNumber,
        customerName:  customerInfo.name ?? 'Customer',
        customerEmail: customerInfo.email,
        status,
        baseUrl,
      })),
    })
  } catch (err) {
    console.error('[sanity-webhook] OrderStatusUpdate email failed:', err)
  }

  return NextResponse.json({ ok: true })
}
