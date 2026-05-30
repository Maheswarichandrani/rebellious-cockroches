import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ContactAdminProps {
  name: string
  email: string
  phone?: string
  message: string
}

export function ContactAdmin({ name, email, phone, message }: ContactAdminProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission from {name}</Preview>
      <Body style={body}>
        <Container style={container}>

          <Section style={header}>
            <Text style={brand}>CJP BRAND STORE</Text>
            <Text style={tag}>New Enquiry</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>New message received</Heading>

            {/* Sender details */}
            <Section style={detailsBox}>
              <Row label="Name" value={name} />
              <Row label="Email" value={email} />
              {phone && <Row label="Phone" value={phone} />}
            </Section>

            <Text style={messageLabel}>MESSAGE</Text>
            <Section style={messageBox}>
              <Text style={messageText}>{message}</Text>
            </Section>

            <Hr style={divider} />

            <Text style={footer}>
              Reply directly to this email to respond to {name}.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Section style={row}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={rowValue}>{value}</Text>
    </Section>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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

const header: React.CSSProperties = {
  backgroundColor: '#1c1c1c',
  padding: '28px 40px',
}

const brand: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  margin: '0 0 4px 0',
}

const tag: React.CSSProperties = {
  backgroundColor: '#ffffff20',
  color: '#ffffff99',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.1em',
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '999px',
  margin: 0,
}

const content: React.CSSProperties = {
  padding: '40px',
}

const heading: React.CSSProperties = {
  color: '#1c1c1c',
  fontSize: '22px',
  fontWeight: '800',
  letterSpacing: '-0.03em',
  margin: '0 0 24px 0',
}

const detailsBox: React.CSSProperties = {
  backgroundColor: '#f7f5f2',
  borderRadius: '6px',
  padding: '4px 20px',
  marginBottom: '24px',
}

const row: React.CSSProperties = {
  padding: '10px 0',
  borderBottom: '1px solid #ebe9e5',
}

const rowLabel: React.CSSProperties = {
  color: '#888',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  margin: '0 0 2px 0',
}

const rowValue: React.CSSProperties = {
  color: '#1c1c1c',
  fontSize: '14px',
  fontWeight: '500',
  margin: 0,
}

const messageLabel: React.CSSProperties = {
  color: '#888',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.1em',
  margin: '0 0 8px 0',
}

const messageBox: React.CSSProperties = {
  backgroundColor: '#f7f5f2',
  borderLeft: '3px solid #1c1c1c',
  borderRadius: '4px',
  padding: '16px 20px',
}

const messageText: React.CSSProperties = {
  color: '#1c1c1c',
  fontSize: '14px',
  lineHeight: '1.65',
  margin: 0,
}

const divider: React.CSSProperties = {
  borderColor: '#ebe9e5',
  margin: '32px 0 24px',
}

const footer: React.CSSProperties = {
  color: '#aaa',
  fontSize: '12px',
  margin: 0,
}
