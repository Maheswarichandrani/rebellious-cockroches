import type { ArrayOfObjectsInputProps } from 'sanity'
import { Box, Card, Flex, Stack, Text } from '@sanity/ui'

type LineItem = {
  _key: string
  productName?: string
  colorVariant?: string
  size?: string
  qty?: number
  priceSnapshot?: number
  sku?: string
}

const COLS = ['Product', 'Colour', 'Size', 'Qty', 'Price', 'SKU']

export function OrderLineItemsDisplay(props: ArrayOfObjectsInputProps) {
  const items = (props.value ?? []) as LineItem[]

  if (items.length === 0) {
    return <Text size={1} muted>No items</Text>
  }

  return (
    <Card border radius={2} overflow="hidden">
      {/* Header */}
      <Box style={{ borderBottom: '1px solid var(--card-border-color)' }}>
        <Flex padding={2} gap={2}>
          {COLS.map((h) => (
            <Box key={h} flex={h === 'Product' ? 3 : 1}>
              <Text size={0} weight="semibold" muted style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {h}
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Rows */}
      <Stack>
        {items.map((item) => (
          <Box
            key={item._key}
            style={{ borderBottom: '1px solid var(--card-border-color)' }}
          >
            <Flex padding={2} gap={2} align="center">
              <Box flex={3}><Text size={1} weight="medium">{item.productName ?? '—'}</Text></Box>
              <Box flex={1}><Text size={1}>{item.colorVariant ?? '—'}</Text></Box>
              <Box flex={1}><Text size={1}>{item.size ?? '—'}</Text></Box>
              <Box flex={1}><Text size={1}>{item.qty ?? '—'}</Text></Box>
              <Box flex={1}><Text size={1}>₹{item.priceSnapshot?.toLocaleString('en-IN') ?? '—'}</Text></Box>
              <Box flex={1}><Text size={0} muted>{item.sku ?? '—'}</Text></Box>
            </Flex>
          </Box>
        ))}
      </Stack>
    </Card>
  )
}
