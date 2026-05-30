export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function generateOrderNumber(): string {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CJP-${y}${m}${d}-${rand}`
}
