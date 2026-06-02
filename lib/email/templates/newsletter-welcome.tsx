import {
  Body, Button, Container, Head, Hr, Html, Preview, Section, Text,
} from '@react-email/components'

interface NewsletterWelcomeProps {
  name:    string
  baseUrl: string
}

export function NewsletterWelcome({ name, baseUrl }: NewsletterWelcomeProps) {
  const firstName = name.split(' ')[0] ?? name

  return (
    <Html>
      <Head />
      <Preview>Welcome to the CJP newsletter — exclusive drops, early access, and more</Preview>
      <Body style={body}>
        <Container style={container}>

          <Section style={header}>
            <Text style={brand}>CJP BRAND STORE</Text>
            <Text style={tag}>Welcome to the Club</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>You&apos;re in, {firstName}!</Text>

            <Text style={paragraph}>
              Thanks for joining the CJP newsletter. You&apos;re now part of an exclusive group that
              gets first access to new drops, members-only deals, and brand updates before anyone else.
            </Text>

            <Section style={perksBox}>
              <Text style={perkItem}>🎯 &nbsp;Early access to new collections</Text>
              <Text style={perkItem}>🏷️ &nbsp;Exclusive discount codes</Text>
              <Text style={perkItem}>📦 &nbsp;Order updates and behind-the-scenes</Text>
            </Section>

            <Text style={paragraph}>
              In the meantime, explore our current collection. You might find something you love.
            </Text>

            <Hr style={divider} />

            <Section style={{ textAlign: 'center' }}>
              <Button href={`${baseUrl}/shop`} style={ctaButton}>Shop the Collection</Button>
            </Section>

            <Hr style={{ ...divider, marginTop: '32px' }} />

            <Text style={footer}>
              You received this because you subscribed at checkout.{'\n'}
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
const paragraph: React.CSSProperties = { color: '#555', fontSize: '14px', lineHeight: '1.65', margin: '0 0 16px 0' }
const perksBox: React.CSSProperties = {
  backgroundColor: '#f7f5f2', borderRadius: '6px', padding: '16px 20px', margin: '0 0 20px 0',
}
const perkItem: React.CSSProperties = {
  color: '#1c1c1c', fontSize: '13px', lineHeight: '1.7', margin: '0 0 4px 0',
}
const divider: React.CSSProperties = { borderColor: '#ebe9e5', margin: '24px 0' }
const ctaButton: React.CSSProperties = {
  backgroundColor: '#1c1c1c', color: '#ffffff', fontSize: '13px', fontWeight: '700',
  letterSpacing: '0.06em', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none',
  display: 'inline-block',
}
const footer: React.CSSProperties = { color: '#aaa', fontSize: '12px', lineHeight: '1.6', margin: 0 }
