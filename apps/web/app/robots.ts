import type { MetadataRoute } from 'next'

import { envConfig } from '@/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${envConfig.NEXT_PUBLIC_URL}/sitemap.xml`,
  }
}
