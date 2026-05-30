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

interface ContactReceivedProps {
  name: string
  message: string
}

export function ContactReceived({ name, message }: ContactReceivedProps) {
  return (
    <Html>
      <Head />
      <Preview>We received your message — CJP Brand Store</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brand}>CJP BRAND STORE</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>We got your message.</Heading>

            <Text style={paragraph}>
              Hi {name},
            </Text>

            <Text style={paragraph}>
              Thanks for reaching out. We&apos;ve received your message and will get back
              to you within 24–48 hours.
            </Text>

            {/* Message echo */}
            <Section style={messageBox}>
              <Text style={messageLabel}>YOUR MESSAGE</Text>
              <Text style={messageText}>{message}</Text>
            </Section>

            <Hr style={divider} />

            <Text style={footer}>
              CJP Brand Store · Official Party Store<br />
              This is an automated reply — please don&apos;t respond to this email.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
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
  margin: '0 0 20px 0',
}

const paragraph: React.CSSProperties = {
  color: '#555',
  fontSize: '15px',
  lineHeight: '1.65',
  margin: '0 0 16px 0',
}

const messageBox: React.CSSProperties = {
  backgroundColor: '#f7f5f2',
  borderLeft: '3px solid #1c1c1c',
  borderRadius: '4px',
  padding: '16px 20px',
  margin: '24px 0',
}

const messageLabel: React.CSSProperties = {
  color: '#888',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.12em',
  margin: '0 0 8px 0',
}

const messageText: React.CSSProperties = {
  color: '#1c1c1c',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: 0,
}

const divider: React.CSSProperties = {
  borderColor: '#ebe9e5',
  margin: '32px 0 24px',
}

const footer: React.CSSProperties = {
  color: '#aaa',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: 0,
}
