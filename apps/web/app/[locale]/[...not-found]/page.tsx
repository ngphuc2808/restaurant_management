import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import Notfound from '@/app/[locale]/[...not-found]/not-found'

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params

  const { locale } = params

  const t = await getTranslations({ locale: locale, namespace: 'NotFound' })

  return {
    title: t('title'),
    description: t('description'),
    robots: {
      index: false,
    },
  }
}

const NotfoundPage = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params
  const { locale } = params

  setRequestLocale(locale)

  return <Notfound />
}

export default NotfoundPage
