import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import { formatPrice } from '@/lib/formatters'

interface LineItem {
  productName: string
  colorVariant: string
  size: string
  qty: number
  priceSnapshot: number
}

interface OrderAddress {
  line1:   string
  line2?:  string
  city:    string
  state:   string
  pincode: string
  country: string
}

interface OrderConfirmationProps {
  order: {
    orderNumber:  string
    paymentId?:   string
    customerInfo: {
      name:    string
      email:   string
      phone?:  string
      address: OrderAddress
    }
    lineItems:    LineItem[]
    subtotal:     number
    shippingCost: number
    total:        number
    createdAt?:   string
  }
  baseUrl: string
}

export function OrderConfirmation({ order, baseUrl }: OrderConfirmationProps) {
  const { orderNumber, paymentId, customerInfo, lineItems, subtotal, shippingCost, total } = order
  const viewOrderUrl = `${baseUrl}/order/success/${orderNumber}?email=${Buffer.from(customerInfo.email).toString('base64url')}`

  return (
    <Html>
      <Head />
      <Preview>Your order {orderNumber} is confirmed — CJP Brand Store</Preview>
      <Body style={body}>
        <Container style={container}>

          <Section style={header}>
            <Text style={brand}>CJP BRAND STORE</Text>
            <Text style={tag}>Order Confirmed</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Your order is on its way!</Heading>

            <Text style={paragraph}>Hi {customerInfo.name},</Text>
            <Text style={paragraph}>
              Thank you for your purchase. We have received your order and it is now being processed.
            </Text>

            {/* Order number */}
            <Section style={highlightBox}>
              <Text style={highlightLabel}>ORDER NUMBER</Text>
              <Text style={highlightValue}>{orderNumber}</Text>
              {paymentId && (
                <>
                  <Text style={highlightLabel}>PAYMENT REFERENCE</Text>
                  <Text style={{ ...highlightValue, fontSize: '13px' }}>{paymentId}</Text>
                </>
              )}
            </Section>

            {/* Line items */}
            <Text style={sectionLabel}>ITEMS ORDERED</Text>
            <Section style={detailsBox}>
              {lineItems.map((item, idx) => (
                <Section
                  key={idx}
                  style={{ ...row, borderBottom: idx < lineItems.length - 1 ? '1px solid #ebe9e5' : 'none' }}
                >
                  <Text style={rowLabel}>{item.productName}</Text>
                  <Text style={rowMeta}>
                    {item.colorVariant} · {item.size} · qty {item.qty}
                  </Text>
                  <Text style={rowPrice}>{formatPrice(item.priceSnapshot * item.qty)}</Text>
                </Section>
              ))}
            </Section>

            {/* Totals */}
            <Section style={totalsBox}>
              <Section style={totalRow}>
                <Text style={totalLabel}>Subtotal</Text>
                <Text style={totalValue}>{formatPrice(subtotal)}</Text>
              </Section>
              <Section style={totalRow}>
                <Text style={totalLabel}>Shipping</Text>
                <Text style={totalValue}>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</Text>
              </Section>
              <Hr style={{ borderColor: '#ebe9e5', margin: '8px 0' }} />
              <Section style={totalRow}>
                <Text style={{ ...totalLabel, fontWeight: '700', color: '#1c1c1c' }}>Total</Text>
                <Text style={{ ...totalValue, fontWeight: '800', color: '#1c1c1c', fontSize: '16px' }}>
                  {formatPrice(total)}
                </Text>
              </Section>
            </Section>

            {/* Shipping address */}
            <Text style={sectionLabel}>SHIPPING TO</Text>
            <Section style={detailsBox}>
              <Text style={rowLabel}>{customerInfo.name}</Text>
              <Text style={rowMeta}>{customerInfo.address.line1}</Text>
              {customerInfo.address.line2 && (
                <Text style={rowMeta}>{customerInfo.address.line2}</Text>
              )}
              <Text style={rowMeta}>
                {customerInfo.address.city}, {customerInfo.address.state}{' '}
                {customerInfo.address.pincode}
              </Text>
              <Text style={rowMeta}>{customerInfo.address.country}</Text>
            </Section>

            <Hr style={divider} />

            <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Button href={viewOrderUrl} style={ctaButton}>
                View Your Order
              </Button>
            </Section>

            <Text style={footer}>
              Questions? Reply to this email or visit our Contact page.{'\n'}
              CJP Brand Store — Official Store
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#f5f3f0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: 0,
  padding: '40px 0',
}
const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  maxWidth: '560px',
  margin: '0 auto',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}
const header: React.CSSProperties = { backgroundColor: '#1c1c1c', padding: '28px 40px' }
const brand: React.CSSProperties = {
  color: '#ffffff', fontSize: '13px', fontWeight: '700', letterSpacing: '0.15em', margin: '0 0 4px 0',
}
const tag: React.CSSProperties = {
  backgroundColor: '#ffffff20', color: '#ffffff99', fontSize: '10px', fontWeight: '700',
  letterSpacing: '0.1em', display: 'inline-block', padding: '2px 8px', borderRadius: '999px', margin: 0,
}
const content: React.CSSProperties = { padding: '40px' }
const heading: React.CSSProperties = {
  color: '#1c1c1c', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.03em', margin: '0 0 20px 0',
}
const paragraph: React.CSSProperties = { color: '#555', fontSize: '14px', lineHeight: '1.65', margin: '0 0 12px 0' }
const sectionLabel: React.CSSProperties = {
  color: '#888', fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em',
  textTransform: 'uppercase', margin: '24px 0 8px 0',
}
const highlightBox: React.CSSProperties = {
  backgroundColor: '#f7f5f2', borderRadius: '6px', padding: '16px 20px', margin: '20px 0',
}
const highlightLabel: React.CSSProperties = {
  color: '#888', fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em',
  textTransform: 'uppercase', margin: '0 0 4px 0',
}
const highlightValue: React.CSSProperties = {
  color: '#1c1c1c', fontSize: '18px', fontWeight: '800', fontFamily: 'monospace', margin: '0 0 12px 0',
}
const detailsBox: React.CSSProperties = {
  backgroundColor: '#f7f5f2', borderRadius: '6px', padding: '4px 20px', marginBottom: '8px',
}
const row: React.CSSProperties = { padding: '10px 0' }
const rowLabel: React.CSSProperties = { color: '#1c1c1c', fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0' }
const rowMeta: React.CSSProperties = { color: '#888', fontSize: '12px', margin: '0 0 2px 0' }
const rowPrice: React.CSSProperties = { color: '#1c1c1c', fontSize: '13px', fontWeight: '600', margin: '2px 0 0 0' }
const totalsBox: React.CSSProperties = {
  backgroundColor: '#f7f5f2', borderRadius: '6px', padding: '12px 20px', marginBottom: '8px',
}
const totalRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '3px 0' }
const totalLabel: React.CSSProperties = { color: '#888', fontSize: '13px', margin: 0 }
const totalValue: React.CSSProperties = { color: '#555', fontSize: '13px', fontWeight: '600', margin: 0 }
const divider: React.CSSProperties = { borderColor: '#ebe9e5', margin: '32px 0 24px' }
const ctaButton: React.CSSProperties = {
  backgroundColor: '#1c1c1c', color: '#ffffff', fontSize: '13px', fontWeight: '700',
  letterSpacing: '0.06em', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none',
  display: 'inline-block',
}
const footer: React.CSSProperties = { color: '#aaa', fontSize: '12px', lineHeight: '1.6', margin: 0 }
