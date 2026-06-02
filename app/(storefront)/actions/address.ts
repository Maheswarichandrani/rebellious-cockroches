'use server'

import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

export interface SavedAddress {
  id:           string
  firstName:    string
  lastName:     string
  phone:        string
  addressLine1: string
  addressLine2?: string
  city:         string
  state:        string
  pincode:      string
  country:      string
  isDefault:    boolean
}

type AddressMetadata = { addresses?: SavedAddress[] }

async function readAddresses(userId: string): Promise<SavedAddress[]> {
  const clerk = await clerkClient()
  const user  = await clerk.users.getUser(userId)
  return ((user.privateMetadata as AddressMetadata).addresses ?? [])
}

async function writeAddresses(userId: string, addresses: SavedAddress[]): Promise<void> {
  const clerk = await clerkClient()
  const user  = await clerk.users.getUser(userId)
  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: { ...(user.privateMetadata as object), addresses },
  })
}

// ── Public actions ────────────────────────────────────────────────────────────

export async function getSavedAddresses(): Promise<SavedAddress[]> {
  const { userId } = await auth()
  if (!userId) return []
  try {
    return await readAddresses(userId)
  } catch {
    return []
  }
}

export async function saveNewAddress(
  address: Omit<SavedAddress, 'id' | 'isDefault'>
): Promise<void> {
  const { userId } = await auth()
  if (!userId) return
  try {
    const existing = await readAddresses(userId)
    const entry: SavedAddress = {
      ...address,
      id:        crypto.randomUUID(),
      isDefault: existing.length === 0,
    }
    await writeAddresses(userId, [...existing, entry])
  } catch (err) {
    console.error('[address] save failed:', err)
  }
}

export async function deleteAddress(id: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) return
  try {
    const existing = await readAddresses(userId)
    const filtered = existing.filter((a) => a.id !== id)
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true
    }
    await writeAddresses(userId, filtered)
  } catch (err) {
    console.error('[address] delete failed:', err)
  }
}
