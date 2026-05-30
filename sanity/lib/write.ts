import 'server-only'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

if (!process.env.SANITY_API_TOKEN) {
  throw new Error('Missing environment variable: SANITY_API_TOKEN')
}

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
