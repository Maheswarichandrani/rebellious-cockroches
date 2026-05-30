import { Metadata } from 'next'
import { ContactForm } from './_components/contact-form'

export const metadata: Metadata = {
  title: 'Contact | CJP Brand Store',
  description: 'Get in touch with us — we respond within 24 hours.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-[100px] pb-24">
      <div className="page-container-narrow">

        {/* Header */}
        <div className="mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Get in touch
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-foreground md:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Questions about sizing, orders, or anything else?
            We&apos;ll get back to you within 24&nbsp;hours.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-card md:p-10">
          <ContactForm />
        </div>

      </div>
    </main>
  )
}
