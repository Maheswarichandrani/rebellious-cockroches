import { useState } from 'react'
import { set } from 'sanity'
import type { StringInputProps } from 'sanity'
import { Badge, Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import { EnvelopeIcon } from '@sanity/icons'

type Tone = 'default' | 'primary' | 'positive' | 'caution' | 'critical'

const STATUS_META: Record<string, { label: string; tone: Tone; desc: string; icon: string }> = {
  pending:    { label: 'Pending',    tone: 'caution',  icon: '🕐', desc: 'Order created, payment not yet received.' },
  paid:       { label: 'Paid',       tone: 'primary',  icon: '💳', desc: 'Payment confirmed. Ready to process.' },
  processing: { label: 'Processing', tone: 'primary',  icon: '📦', desc: 'Being packed and prepared for dispatch.' },
  shipped:    { label: 'Shipped',    tone: 'positive', icon: '🚚', desc: 'Dispatched and on the way to customer.' },
  delivered:  { label: 'Delivered',  tone: 'positive', icon: '✅', desc: 'Successfully delivered to customer.' },
  cancelled:  { label: 'Cancelled',  tone: 'critical', icon: '❌', desc: 'Order has been cancelled.' },
  refunded:   { label: 'Refunded',   tone: 'default',  icon: '↩️', desc: 'Payment has been refunded.' },
}

const TRANSITIONS: Record<string, string[]> = {
  pending:    ['paid', 'cancelled'],
  paid:       ['processing', 'refunded', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
  refunded:   [],
}

// These statuses trigger an automatic customer email via Sanity webhook
const EMAIL_TRIGGERS = new Set(['processing', 'shipped', 'delivered', 'cancelled'])

export function OrderStatusInput(props: StringInputProps) {
  const current = (props.value ?? 'pending') as string
  const meta    = STATUS_META[current] ?? { label: current, tone: 'default', icon: '●', desc: '' }
  const options = TRANSITIONS[current] ?? []

  const [confirming, setConfirming] = useState<string | null>(null)

  function handleSelect(next: string) { setConfirming(next) }
  function handleCancel()             { setConfirming(null) }
  function handleConfirm(next: string) {
    props.onChange(set(next))
    setConfirming(null)
  }

  return (
    <Stack space={4}>

      {/* Current status card */}
      <Card padding={3} radius={3} tone={meta.tone} border>
        <Flex align="center" gap={3}>
          <Text size={2}>{meta.icon}</Text>
          <Stack space={1} flex={1}>
            <Flex align="center" gap={2}>
              <Text size={2} weight="semibold">{meta.label}</Text>
              <Badge tone={meta.tone} fontSize={0} padding={1} radius={5} mode="outline">current</Badge>
            </Flex>
            <Text size={1} muted>{meta.desc}</Text>
          </Stack>
        </Flex>
      </Card>

      {/* Available transitions */}
      {options.length > 0 && (
        <Stack space={2}>
          <Text size={1} weight="semibold" muted style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Change status to
          </Text>

          {options.map((next) => {
            const nm           = STATUS_META[next] ?? { label: next, tone: 'default', icon: '●', desc: '' }
            const sendsEmail   = EMAIL_TRIGGERS.has(next)
            const isConfirming = confirming === next

            return (
              <Card key={next} padding={3} radius={3} border tone={isConfirming ? nm.tone : 'default'}>
                <Flex align="center" gap={3}>
                  <Text size={2}>{nm.icon}</Text>

                  <Stack space={1} flex={1}>
                    <Flex align="center" gap={2} wrap="wrap">
                      <Text size={2} weight="medium">{nm.label}</Text>
                      {sendsEmail && (
                        <Flex align="center" gap={1}>
                          <EnvelopeIcon style={{ fontSize: 12, opacity: 0.6 }} />
                          <Text size={0} muted>Customer email sent</Text>
                        </Flex>
                      )}
                    </Flex>
                    <Text size={1} muted>{nm.desc}</Text>
                  </Stack>

                  <Box style={{ flexShrink: 0 }}>
                    {isConfirming ? (
                      <Flex gap={2}>
                        <Button
                          tone={nm.tone}
                          mode="default"
                          fontSize={1}
                          padding={2}
                          text="✓ Confirm"
                          onClick={() => handleConfirm(next)}
                        />
                        <Button
                          mode="ghost"
                          fontSize={1}
                          padding={2}
                          text="Cancel"
                          onClick={handleCancel}
                        />
                      </Flex>
                    ) : (
                      <Button
                        mode="ghost"
                        tone={nm.tone}
                        fontSize={1}
                        padding={2}
                        text="Select"
                        onClick={() => handleSelect(next)}
                        disabled={confirming !== null && !isConfirming}
                      />
                    )}
                  </Box>
                </Flex>
              </Card>
            )
          })}
        </Stack>
      )}

      {options.length === 0 && (
        <Card padding={3} radius={3} tone="default" border>
          <Text size={1} muted>Terminal state — no further changes allowed.</Text>
        </Card>
      )}

      {/* Email reminder */}
      <Card padding={3} radius={2} tone="caution" border>
        <Flex align="center" gap={2}>
          <EnvelopeIcon style={{ fontSize: 14, flexShrink: 0 }} />
          <Text size={1}>
            Statuses marked <strong>Customer email sent</strong> trigger an automatic email on save.
            Requires Sanity webhook configured at <code>/api/sanity/order-status</code>.
          </Text>
        </Flex>
      </Card>

    </Stack>
  )
}
