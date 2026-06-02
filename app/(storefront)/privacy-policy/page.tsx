import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | CJP Brand Store',
  description: 'How CJP Brand Store collects, uses, and protects your personal information.',
}

const LAST_UPDATED = 'June 2, 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen pt-6 pb-24 md:pt-8">
      <div className="page-container-narrow">

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
            Legal
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <Section title="1. Who We Are">
          <p>
            CJP Brand Store (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates this website and online store.
            We are committed to protecting your personal data and your right to privacy.
          </p>
          <p>
            If you have any questions about this policy or our data practices, contact us at{' '}
            <a href="mailto:admin@cjpbrand.in" className="text-foreground underline underline-offset-2 hover:text-primary transition-colors">
              admin@cjpbrand.in
            </a>.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect information you provide directly when you:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Place an order — name, email address, phone number, shipping and billing address</li>
            <li>Create an account — email address, name (via Clerk authentication)</li>
            <li>Contact us — name, email, and message content</li>
            <li>Subscribe to our newsletter — email address</li>
          </ul>
          <p>
            We also automatically collect certain technical data when you visit our site, including
            IP address, browser type, pages visited, and referring URLs. This is collected through
            standard server logs and is used only for security and performance monitoring.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-1">
            <li>Process and fulfil your orders</li>
            <li>Send order confirmations and shipping updates to your email</li>
            <li>Respond to customer service enquiries</li>
            <li>Send marketing emails if you opted in (you may unsubscribe at any time)</li>
            <li>Prevent fraud and maintain the security of our store</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>We do not sell or rent your personal data to third parties.</p>
        </Section>

        <Section title="4. Payment Processing">
          <p>
            All payments are processed securely by{' '}
            <strong className="text-foreground">Razorpay</strong>. We do not store your card
            number, CVV, or full payment details on our servers. Razorpay&apos;s privacy policy
            governs how your payment data is handled during a transaction.
          </p>
          <p>
            We store only your Razorpay Order ID and Payment ID for order tracking and reconciliation
            purposes.
          </p>
        </Section>

        <Section title="5. Authentication">
          <p>
            Account creation and login are handled by{' '}
            <strong className="text-foreground">Clerk</strong>. Your password is never stored on
            our servers. Clerk manages credential storage, multi-factor authentication, and session
            tokens. Please review{' '}
            <a
              href="https://clerk.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:text-primary transition-colors"
            >
              Clerk&apos;s Privacy Policy
            </a>{' '}
            for details.
          </p>
          <p>
            Saved delivery addresses are stored in your Clerk account&apos;s private metadata —
            accessible only to you and our server-side order processing.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>
            We use strictly necessary cookies to maintain your shopping cart session and
            authentication state. We do not use third-party advertising or tracking cookies.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Session cookies</strong> — keep you signed in during your visit</li>
            <li><strong className="text-foreground">Cart persistence</strong> — stored in your browser&apos;s localStorage, not transmitted to us</li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          <p>
            Order records are retained for 7 years to comply with Indian tax and accounting
            regulations (GST Act). Account data is retained until you request deletion.
            Contact us at{' '}
            <a href="mailto:admin@cjpbrand.in" className="text-foreground underline underline-offset-2 hover:text-primary transition-colors">
              admin@cjpbrand.in
            </a>{' '}
            to request deletion of your account or order data where legally permissible.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data (subject to legal retention requirements)</li>
            <li>Withdraw consent for marketing emails at any time via the unsubscribe link</li>
            <li>Lodge a complaint with the relevant data protection authority</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{' '}
            <a href="mailto:admin@cjpbrand.in" className="text-foreground underline underline-offset-2 hover:text-primary transition-colors">
              admin@cjpbrand.in
            </a>.
          </p>
        </Section>

        <Section title="9. Third-Party Services">
          <p>Our store integrates with the following third-party services, each governed by their own privacy policies:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Sanity</strong> — headless CMS for product and order data storage</li>
            <li><strong className="text-foreground">Clerk</strong> — user authentication and account management</li>
            <li><strong className="text-foreground">Razorpay</strong> — payment processing</li>
            <li><strong className="text-foreground">Resend</strong> — transactional email delivery</li>
            <li><strong className="text-foreground">Geoapify</strong> — address autocomplete (query text sent to Geoapify API; no personal data stored by them)</li>
          </ul>
        </Section>

        <Section title="10. Security">
          <p>
            We implement reasonable technical and organisational measures to protect your data,
            including HTTPS encryption, server-side validation of all order data, and restricted
            access to our Sanity write credentials. No method of transmission over the internet
            is 100% secure; we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at
            the top reflects the most recent revision. Continued use of the store after changes
            are posted constitutes acceptance of the revised policy.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For any privacy-related questions or requests:
          </p>
          <address className="not-italic space-y-0.5">
            <p className="text-foreground font-medium">CJP Brand Store</p>
            <p>
              <a href="mailto:admin@cjpbrand.in" className="text-foreground underline underline-offset-2 hover:text-primary transition-colors">
                admin@cjpbrand.in
              </a>
            </p>
          </address>
        </Section>

      </div>
    </main>
  )
}
