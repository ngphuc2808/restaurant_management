import { MetadataRoute } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Pick a locale that is representative of the app
  const locale = await getLocale()

  const t = await getTranslations({
    namespace: 'Brand',
    locale,
  })

  return {
    name: t('title'),
    short_name: t('defaultTitle'),
    start_url: '/',
    theme_color: '#f59a42',
  }
}
