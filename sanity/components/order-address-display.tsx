import type { ObjectInputProps } from 'sanity'
import { Card, Flex, Stack, Text } from '@sanity/ui'

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <Flex gap={3}>
      <Text size={1} muted style={{ minWidth: 72, flexShrink: 0 }}>{label}</Text>
      <Text size={1}>{value}</Text>
    </Flex>
  )
}

export function OrderAddressDisplay(props: ObjectInputProps) {
  const val = props.value as Record<string, unknown> | undefined

  if (!val) {
    return <Text size={1} muted>No information recorded</Text>
  }

  const isCustomerInfo = 'address' in val
  const addr = (isCustomerInfo
    ? val.address as Record<string, string>
    : val) as Record<string, string> | undefined

  const addressLine = addr
    ? [
        addr.line1,
        addr.line2,
        addr.city,
        addr.state && addr.pincode
          ? `${addr.state} – ${addr.pincode}`
          : addr.state || addr.pincode,
        addr.country,
      ].filter(Boolean).join(', ')
    : null

  return (
    <Card tone="transparent" border radius={2} padding={3}>
      <Stack space={2}>
        {isCustomerInfo && (
          <>
            <Row label="Name"    value={val.name as string} />
            <Row label="Email"   value={val.email as string} />
            <Row label="Phone"   value={val.phone as string} />
          </>
        )}
        {!isCustomerInfo && <Row label="Name" value={val.name as string} />}
        {addressLine && <Row label="Address" value={addressLine} />}
      </Stack>
    </Card>
  )
}
