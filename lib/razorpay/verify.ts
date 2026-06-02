import crypto from 'crypto'

export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) return false
  const body = `${razorpayOrderId}|${razorpayPaymentId}`
  const expected = crypto.createHmac('sha256', keySecret).update(body).digest('hex')
  return expected === signature
}

export function verifyWebhookSignature(rawBody: string, receivedSignature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return expected === receivedSignature
}
