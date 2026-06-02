import { set } from 'sanity'
import type { StringInputProps } from 'sanity'
import { Badge, Box, Button, Flex, Stack, Text } from '@sanity/ui'

type Tone = 'default' | 'primary' | 'positive' | 'caution' | 'critical'

const STATUS_TONES: Record<string, Tone> = {
  pending:    'caution',
  paid:       'primary',
  processing: 'primary',
  shipped:    'positive',
  delivered:  'positive',
  cancelled:  'critical',
  refunded:   'default',
}

const STATUS_LABELS: Record<string, string> = {
  pending:    'Pending',
  paid:       'Paid',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
  refunded:   'Refunded',
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

export function OrderStatusInput(props: StringInputProps) {
  const current = (props.value ?? 'pending') as string
  const nextOptions = TRANSITIONS[current] ?? []

  return (
    <Stack space={3}>
      <Flex align="center" gap={3} wrap="wrap">
        <Badge tone={STATUS_TONES[current] ?? 'default'} fontSize={1} padding={2} radius={5}>
          {STATUS_LABELS[current] ?? current}
        </Badge>
        {nextOptions.length === 0 && (
          <Text size={1} muted>Terminal state — no further transitions allowed</Text>
        )}
      </Flex>

      {nextOptions.length > 0 && (
        <Flex align="center" gap={2} wrap="wrap">
          <Text size={1} muted>Advance to →</Text>
          {nextOptions.map((next) => (
            <Button
              key={next}
              mode="ghost"
              tone={STATUS_TONES[next] ?? 'default'}
              fontSize={1}
              padding={2}
              radius={2}
              text={STATUS_LABELS[next] ?? next}
              onClick={() => props.onChange(set(next))}
            />
          ))}
        </Flex>
      )}
    </Stack>
  )
}
