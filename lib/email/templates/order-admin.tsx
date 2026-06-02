import {
  Body, Button, Container, Head, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import { formatPrice } from '@/lib/formatters'

interface LineItem {
  productName:  string
  colorVariant: string
  size:         string
  qty:          number
  priceSnapshot: number
}

interface OrderAdminProps {
  order: {
    orderNumber:   string
    total:         number
    subtotal:      number
    shippingCost:  number
    customerInfo: {
      name:   string
      email:  string
      phone?: string
      address: {
        line1:    string
        line2?:   string
        city:     string
        state:    string
        pincode:  string
        country:  string
      }
    }
    lineItems:     LineItem[]
    shippingMethodName?: string | null
  }
  paymentId?: string
  baseUrl:    string
}

export function OrderAdmin({ order, paymentId, baseUrl }: OrderAdminProps) {
  const { orderNumber, total, subtotal, shippingCost, customerInfo, lineItems, shippingMethodName } = order
  const studioUrl = `${baseUrl}/studio/structure/orders`

  return (
    <Html>
      <Head />
      <Preview>New order {orderNumber} — {customerInfo.name} — {formatPrice(total)}</Preview>
      <Body style={body}>
        <Container style={container}>

          <Section style={header}>
            <Text style={brand}>CJP BRAND STORE</Text>
            <Text style={tag}>New Order Received</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>New order placed</Text>

            {/* Order summary */}
            <Section style={highlightBox}>
              <Text style={label}>ORDER NUMBER</Text>
              <Text style={mono}>{orderNumber}</Text>
              {paymentId && (
                <>
                  <Text style={{ ...label, marginTop: '8px' }}>PAYMENT ID</Text>
                  <Text style={{ ...mono, fontSize: '12px' }}>{paymentId}</Text>
                </>
              )}
              <Text style={{ ...label, marginTop: '8px' }}>ORDER TOTAL</Text>
              <Text style={{ ...mono, color: '#1c1c1c' }}>{formatPrice(total)}</Text>
            </Section>

            {/* Customer */}
            <Text style={sectionLabel}>CUSTOMER</Text>
            <Section style={detailsBox}>
              <Text style={rowLabel}>{customerInfo.name}</Text>
              <Text style={rowMeta}>{customerInfo.email}</Text>
              {customerInfo.phone && <Text style={rowMeta}>{customerInfo.phone}</Text>}
            </Section>

            {/* Shipping */}
            <Text style={sectionLabel}>SHIP TO {shippingMethodName ? `· ${shippingMethodName}` : ''}</Text>
            <Section style={detailsBox}>
              <Text style={rowMeta}>{customerInfo.address.line1}</Text>
              {customerInfo.address.line2 && <Text style={rowMeta}>{customerInfo.address.line2}</Text>}
              <Text style={rowMeta}>
                {customerInfo.address.city}, {customerInfo.address.state} {customerInfo.address.pincode}
              </Text>
              <Text style={rowMeta}>{customerInfo.address.country}</Text>
            </Section>

            {/* Items */}
            <Text style={sectionLabel}>ITEMS ({lineItems.length})</Text>
            <Section style={detailsBox}>
              {lineItems.map((item, idx) => (
                <Section
                  key={idx}
                  style={{ padding: '8px 0', borderBottom: idx < lineItems.length - 1 ? '1px solid #ebe9e5' : 'none' }}
                >
                  <Text style={rowLabel}>{item.productName}</Text>
                  <Text style={rowMeta}>{item.colorVariant} · {item.size} · qty {item.qty}</Text>
                  <Text style={rowMeta}>{formatPrice(item.priceSnapshot * item.qty)}</Text>
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
                <Text style={{ ...totalValue, fontWeight: '800', color: '#1c1c1c', fontSize: '15px' }}>
                  {formatPrice(total)}
                </Text>
              </Section>
            </Section>

            <Hr style={divider} />

            <Section style={{ textAlign: 'center' }}>
              <Button href={studioUrl} style={ctaButton}>Open Sanity Studio</Button>
            </Section>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#f5f3f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: 0, padding: '40px 0',
}
const container: React.CSSProperties = {
  backgroundColor: '#ffffff', maxWidth: '560px', margin: '0 auto',
  borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
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
  color: '#1c1c1c', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 20px 0',
}
const sectionLabel: React.CSSProperties = {
  color: '#888', fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em',
  textTransform: 'uppercase', margin: '20px 0 6px 0',
}
const highlightBox: React.CSSProperties = {
  backgroundColor: '#f7f5f2', borderRadius: '6px', padding: '16px 20px', margin: '0 0 8px 0',
}
const label: React.CSSProperties = {
  color: '#888', fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em',
  textTransform: 'uppercase', margin: '0 0 4px 0',
}
const mono: React.CSSProperties = {
  color: '#1c1c1c', fontSize: '16px', fontWeight: '800', fontFamily: 'monospace', margin: 0,
}
const detailsBox: React.CSSProperties = {
  backgroundColor: '#f7f5f2', borderRadius: '6px', padding: '8px 20px', marginBottom: '4px',
}
const rowLabel: React.CSSProperties = { color: '#1c1c1c', fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0' }
const rowMeta: React.CSSProperties = { color: '#888', fontSize: '12px', margin: '0 0 2px 0' }
const totalsBox: React.CSSProperties = {
  backgroundColor: '#f7f5f2', borderRadius: '6px', padding: '12px 20px', margin: '8px 0',
}
const totalRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '3px 0' }
const totalLabel: React.CSSProperties = { color: '#888', fontSize: '13px', margin: 0 }
const totalValue: React.CSSProperties = { color: '#555', fontSize: '13px', fontWeight: '600', margin: 0 }
const divider: React.CSSProperties = { borderColor: '#ebe9e5', margin: '28px 0 24px' }
const ctaButton: React.CSSProperties = {
  backgroundColor: '#1c1c1c', color: '#ffffff', fontSize: '13px', fontWeight: '700',
  letterSpacing: '0.06em', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none',
  display: 'inline-block',
}
