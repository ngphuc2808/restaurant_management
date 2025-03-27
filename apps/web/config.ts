import { z } from 'zod'

const configSchema = z.object({
  NEXT_PUBLIC_API_ENDPOINT: z.string(),
  NEXT_PUBLIC_API_ENDPOINT_SOCKET: z.string(),
  NEXT_PUBLIC_URL: z.string(),
  NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI: z.string(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
})

const configObject = configSchema.safeParse({
  NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT as string,
  NEXT_PUBLIC_API_ENDPOINT_SOCKET: process.env
    .NEXT_PUBLIC_API_ENDPOINT_SOCKET as string,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL as string,
  NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI: process.env
    .NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI as string,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env
    .NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
})

if (!configObject.success) {
  console.log(configObject.error.errors)
  throw new Error('Invalid config')
}

export const envConfig = configObject.data

export type Locale = (typeof locales)[number]

export const locales = ['en', 'vi'] as const
export const defaultLocale: Locale = 'vi'
