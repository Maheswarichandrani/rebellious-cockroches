import {
  Body, Button, Container, Head, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import { formatPrice } from '@/lib/formatters'

interface RefundNotificationProps {
  customerName:  string
  orderNumber:   string
  refundAmount:  number
  baseUrl:       string
}

export function RefundNotification({ customerName, orderNumber, refundAmount, baseUrl }: RefundNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Refund of {formatPrice(refundAmount)} is being processed for order {orderNumber}</Preview>
      <Body style={body}>
        <Container style={container}>

          <Section style={header}>
            <Text style={brand}>CJP BRAND STORE</Text>
            <Text style={tag}>Refund Initiated</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>Your refund is on its way</Text>

            <Text style={paragraph}>Hi {customerName},</Text>
            <Text style={paragraph}>
              We have initiated a refund of <strong>{formatPrice(refundAmount)}</strong> for order{' '}
              <strong>{orderNumber}</strong>. Please allow 5–7 business days for the amount to reflect in
              your original payment method.
            </Text>

            <Section style={highlightBox}>
              <Text style={highlightLabel}>ORDER NUMBER</Text>
              <Text style={highlightValue}>{orderNumber}</Text>
              <Text style={{ ...highlightLabel, marginTop: '8px' }}>REFUND AMOUNT</Text>
              <Text style={{ ...highlightValue, color: '#16a34a' }}>{formatPrice(refundAmount)}</Text>
              <Text style={{ ...highlightLabel, marginTop: '8px' }}>TIMELINE</Text>
              <Text style={{ ...highlightValue, fontSize: '13px', fontFamily: 'inherit', fontWeight: '500' }}>
                5–7 business days
              </Text>
            </Section>

            <Text style={paragraph}>
              Refunds go back to the original payment method. If you do not see the refund within
              7 business days, please contact your bank or reach out to us.
            </Text>

            <Hr style={divider} />

            <Section style={{ textAlign: 'center' }}>
              <Button href={`${baseUrl}/contact`} style={ctaButton}>Contact Support</Button>
            </Section>

            <Hr style={{ ...divider, marginTop: '32px' }} />

            <Text style={footer}>
              CJP Brand Store — Official Store{'\n'}
              Reply to this email if you need help.
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
const paragraph: React.CSSProperties = { color: '#555', fontSize: '14px', lineHeight: '1.65', margin: '0 0 12px 0' }
const highlightBox: React.CSSProperties = {
  backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px',
  padding: '16px 20px', margin: '16px 0',
}
const highlightLabel: React.CSSProperties = {
  color: '#888', fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em',
  textTransform: 'uppercase', margin: '0 0 4px 0',
}
const highlightValue: React.CSSProperties = {
  color: '#1c1c1c', fontSize: '16px', fontWeight: '800', fontFamily: 'monospace', margin: '0 0 4px 0',
}
const divider: React.CSSProperties = { borderColor: '#ebe9e5', margin: '24px 0' }
const ctaButton: React.CSSProperties = {
  backgroundColor: '#1c1c1c', color: '#ffffff', fontSize: '13px', fontWeight: '700',
  letterSpacing: '0.06em', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none',
  display: 'inline-block',
}
const footer: React.CSSProperties = { color: '#aaa', fontSize: '12px', lineHeight: '1.6', margin: 0 }
