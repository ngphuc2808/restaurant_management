import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { cache } from 'react'

import dishApiRequest from '@/apiRequests/dish'
import { htmlToTextForDescription } from '@/lib/server-utils'
import { wrapServerApi } from '@/lib/utils'
import MenuOrder from '@/app/[locale]/guest/menu/menu-order'
import { envConfig } from '@/config'
import { baseOpenGraph } from '@/shared-metadata'

const getDishList = cache(() => wrapServerApi(() => dishApiRequest.list()))

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'GuestMenu',
  })

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/guest/menu`

  return {
    title: t('title'),
    description: htmlToTextForDescription(t('description')),
    openGraph: {
      ...baseOpenGraph,
      title: t('title'),
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

const MenuPage = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params
  const { locale } = params

  setRequestLocale(locale)

  const result = await getDishList()
  const dishes = result?.payload.data ?? []

  return <MenuOrder dishes={dishes} />
}

export default MenuPage
