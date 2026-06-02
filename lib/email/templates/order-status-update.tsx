import {
  Body, Button, Container, Head, Hr, Html, Preview, Section, Text,
} from '@react-email/components'

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface StatusConfig {
  tag:     string
  heading: string
  body:    string
  headerBg: string
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  processing: {
    tag:      'Processing',
    heading:  'Your order is being prepared',
    body:     'Our team is carefully picking and packing your items. We\'ll send you another update when your order ships.',
    headerBg: '#7c3aed',
  },
  shipped: {
    tag:      'Shipped',
    heading:  'Your order is on its way!',
    body:     'Your parcel has been dispatched and is on its way to you. Allow 3–7 business days for delivery depending on your location.',
    headerBg: '#0891b2',
  },
  delivered: {
    tag:      'Delivered',
    heading:  'Your order has arrived!',
    body:     'Your order has been delivered. We hope you love your new CJP gear! Tag us if you wear it — we\'d love to see.',
    headerBg: '#16a34a',
  },
  cancelled: {
    tag:      'Cancelled',
    heading:  'Your order has been cancelled',
    body:     'Your order has been cancelled. If you did not request this cancellation or believe this is an error, please contact our support team.',
    headerBg: '#dc2626',
  },
}

interface OrderStatusUpdateProps {
  orderNumber:   string
  customerName:  string
  customerEmail: string
  status:        OrderStatus | string
  baseUrl:       string
}

export function OrderStatusUpdate({
  orderNumber, customerName, customerEmail, status, baseUrl,
}: OrderStatusUpdateProps) {
  const cfg = STATUS_CONFIG[status as OrderStatus] ?? STATUS_CONFIG.processing
  const firstName = customerName.split(' ')[0] ?? customerName
  const viewOrderUrl = `${baseUrl}/order/success/${orderNumber}?email=${Buffer.from(customerEmail).toString('base64url')}`

  return (
    <Html>
      <Head />
      <Preview>{cfg.heading} — Order {orderNumber}</Preview>
      <Body style={body}>
        <Container style={container}>

          <Section style={{ ...header, backgroundColor: cfg.headerBg }}>
            <Text style={brand}>CJP BRAND STORE</Text>
            <Text style={tag}>{cfg.tag}</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>{cfg.heading}</Text>

            <Text style={paragraph}>Hi {firstName},</Text>
            <Text style={paragraph}>{cfg.body}</Text>

            <Section style={highlightBox}>
              <Text style={highlightLabel}>ORDER NUMBER</Text>
              <Text style={highlightValue}>{orderNumber}</Text>
              <Text style={{ ...highlightLabel, marginTop: '8px' }}>STATUS</Text>
              <Text style={{ ...highlightValue, fontSize: '14px', color: cfg.headerBg }}>
                {cfg.tag}
              </Text>
            </Section>

            <Hr style={divider} />

            <Section style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Button href={viewOrderUrl} style={ctaButton}>View Order</Button>
            </Section>

            {status === 'cancelled' && (
              <Section style={{ textAlign: 'center' }}>
                <Button href={`${baseUrl}/contact`} style={ctaSecondary}>Contact Support</Button>
              </Section>
            )}

            <Hr style={{ ...divider, marginTop: '32px' }} />

            <Text style={footer}>
              Questions? Reply to this email or visit our{' '}
              <a href={`${baseUrl}/contact`} style={{ color: '#1c1c1c' }}>Contact page</a>.{'\n'}
              CJP Brand Store — Official Store
            </Text>
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
const header: React.CSSProperties = { padding: '28px 40px' }
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
const paragraph: React.CSSProperties = { color: '#555', fontSize: '14px', lineHeight: '1.65', margin: '0 0 12px 0' }
const highlightBox: React.CSSProperties = {
  backgroundColor: '#f7f5f2', borderRadius: '6px', padding: '16px 20px', margin: '20px 0',
}
const highlightLabel: React.CSSProperties = {
  color: '#888', fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em',
  textTransform: 'uppercase', margin: '0 0 4px 0',
}
const highlightValue: React.CSSProperties = {
  color: '#1c1c1c', fontSize: '16px', fontWeight: '800', fontFamily: 'monospace', margin: 0,
}
const divider: React.CSSProperties = { borderColor: '#ebe9e5', margin: '24px 0' }
const ctaButton: React.CSSProperties = {
  backgroundColor: '#1c1c1c', color: '#ffffff', fontSize: '13px', fontWeight: '700',
  letterSpacing: '0.06em', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none',
  display: 'inline-block',
}
const ctaSecondary: React.CSSProperties = {
  backgroundColor: 'transparent', color: '#1c1c1c', fontSize: '13px', fontWeight: '700',
  letterSpacing: '0.06em', padding: '11px 24px', borderRadius: '6px', textDecoration: 'none',
  display: 'inline-block', border: '1.5px solid #e5e5e5',
}
const footer: React.CSSProperties = { color: '#aaa', fontSize: '12px', lineHeight: '1.6', margin: 0 }
