import { currentUser } from '@clerk/nextjs/server'
import { CheckoutClient } from './_components/checkout-client'
import { getSavedAddresses } from '@/app/actions/address'

export const metadata = {
  title: 'Checkout | CJP Brand Store',
}

export default async function CheckoutPage() {
  const user = await currentUser()

  const [savedAddresses] = await Promise.all([
    user ? getSavedAddresses() : Promise.resolve([]),
  ])

  const prefill = user
    ? {
        firstName: user.firstName ?? undefined,
        lastName:  user.lastName  ?? undefined,
        email:     user.emailAddresses[0]?.emailAddress ?? undefined,
      }
    : undefined

  return (
    <CheckoutClient
      prefill={prefill}
      savedAddresses={savedAddresses}
      isLoggedIn={!!user}
    />
  )
}
