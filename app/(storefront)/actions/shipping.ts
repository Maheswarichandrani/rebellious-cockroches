'use server'

import { client } from '@/sanity/lib/client'
import { SHIPPING_METHODS_QUERY } from '@/sanity/lib/queries'

export interface ShippingMethod {
  _id:                  string
  name:                 string
  description:          string
  price:                number
  freeAboveOrderTotal?: number
  estimatedMinDays?:    number
  estimatedMaxDays?:    number
  deliveryZones?:       string[]
}

export async function getShippingMethodsForPincode(
  pincode: string
): Promise<ShippingMethod[]> {
  if (!/^\d{6}$/.test(pincode)) return []

  const all: ShippingMethod[] = await client.fetch(
    SHIPPING_METHODS_QUERY,
    {},
    { next: { revalidate: 300 } }
  )

  return (all ?? []).filter(
    (m) => !m.deliveryZones?.length || m.deliveryZones.some((z) => pincode.startsWith(z))
  )
}
