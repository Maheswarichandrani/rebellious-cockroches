import {
  Body, Button, Container, Head, Hr, Html, Preview, Row, Column, Section, Text,
} from '@react-email/components'

interface PaymentFailedProps {
  customerName: string
  orderNumber:  string
  baseUrl:      string
}

export function PaymentFailed({ customerName, orderNumber, baseUrl }: PaymentFailedProps) {
  return (
    <Html>
      <Head />
      <Preview>Payment unsuccessful for order {orderNumber} — no money was deducted</Preview>
      <Body style={body}>
        <Container style={container}>

          <Section style={header}>
            <Text style={brand}>CJP BRAND STORE</Text>
            <Text style={tag}>Payment Unsuccessful</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>Your payment could not be processed</Text>

            <Text style={paragraph}>Hi {customerName},</Text>
            <Text style={paragraph}>
              We were unable to process your payment for order <strong>{orderNumber}</strong>.
              Don&apos;t worry — <strong>no money was deducted</strong> from your account.
            </Text>

            <Section style={highlightBox}>
              <Text style={highlightLabel}>ORDER NUMBER</Text>
              <Text style={highlightValue}>{orderNumber}</Text>
              <Text style={{ ...highlightLabel, marginTop: '8px', color: '#dc2626' }}>STATUS</Text>
              <Text style={{ ...highlightValue, fontSize: '14px', color: '#dc2626' }}>Payment Failed</Text>
            </Section>

            <Text style={paragraph}>
              This can happen due to insufficient funds, a network issue, or a bank decline.
              You can try again or contact your bank if the issue persists.
            </Text>

            <Hr style={divider} />

            <Row>
              <Column align="center" style={{ paddingRight: '6px' }}>
                <Button href={`${baseUrl}/checkout`} style={ctaPrimary}>Try Again</Button>
              </Column>
              <Column align="center" style={{ paddingLeft: '6px' }}>
                <Button href={`${baseUrl}/contact`} style={ctaSecondary}>Contact Support</Button>
              </Column>
            </Row>

            <Hr style={{ ...divider, marginTop: '32px' }} />

            <Text style={footer}>
              CJP Brand Store — Official Store{'\n'}
              If you need help, reply to this email.
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
const header: React.CSSProperties = { backgroundColor: '#dc2626', padding: '28px 40px' }
const brand: React.CSSProperties = {
  color: '#ffffff', fontSize: '13px', fontWeight: '700', letterSpacing: '0.15em', margin: '0 0 4px 0',
}
const tag: React.CSSProperties = {
  backgroundColor: '#ffffff20', color: '#ffffffcc', fontSize: '10px', fontWeight: '700',
  letterSpacing: '0.1em', display: 'inline-block', padding: '2px 8px', borderRadius: '999px', margin: 0,
}
const content: React.CSSProperties = { padding: '40px' }
const heading: React.CSSProperties = {
  color: '#1c1c1c', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 20px 0',
}
const paragraph: React.CSSProperties = { color: '#555', fontSize: '14px', lineHeight: '1.65', margin: '0 0 12px 0' }
const highlightBox: React.CSSProperties = {
  backgroundColor: '#fff5f5', border: '1px solid #fecaca', borderRadius: '6px',
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
const ctaPrimary: React.CSSProperties = {
  backgroundColor: '#1c1c1c', color: '#ffffff', fontSize: '13px', fontWeight: '700',
  letterSpacing: '0.06em', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none',
  display: 'inline-block',
}
const ctaSecondary: React.CSSProperties = {
  backgroundColor: 'transparent', color: '#1c1c1c', fontSize: '13px', fontWeight: '700',
  letterSpacing: '0.06em', padding: '11px 24px', borderRadius: '6px', textDecoration: 'none',
  display: 'inline-block', border: '1.5px solid #1c1c1c',
}
const footer: React.CSSProperties = { color: '#aaa', fontSize: '12px', lineHeight: '1.6', margin: 0 }
