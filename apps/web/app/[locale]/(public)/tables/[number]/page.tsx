import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { htmlToTextForDescription } from '@/lib/server-utils'
import GuestLoginForm from '@/app/[locale]/(public)/tables/[number]/guest-login-form'
import { envConfig } from '@/config'
import { baseOpenGraph } from '@/shared-metadata'

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'LoginGuest',
  })

  const url =
    envConfig.NEXT_PUBLIC_URL + `/${params.locale}/tables/${params.number}`

  return {
    title: `${t('tableNumber', {
      number: params.number,
    })} | ${t('title')}`,
    description: htmlToTextForDescription(t('description')),
    openGraph: {
      ...baseOpenGraph,
      title: `${t('tableNumber', {
        number: params.number,
      })} | ${t('title')}`,
      description: htmlToTextForDescription(t('description')),
      url,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: false,
    },
  }
}

const TableNumberPage = async (props: {
  params: Promise<{ locale: string }>
}) => {
  const params = await props.params
  const { locale } = params

  setRequestLocale(locale)

  return <GuestLoginForm />
}

export default TableNumberPage
