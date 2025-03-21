import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { cache } from 'react'

import dishApiRequest from '@/apiRequests/dish'
import { generateSlugUrl, getIdFromSlugUrl, wrapServerApi } from '@/lib/utils'
import { htmlToTextForDescription } from '@/lib/server-utils'
import DishDetail from '@/app/[locale]/(public)/dishes/[slug]/dish-detail'
import { envConfig } from '@/config'
import { baseOpenGraph } from '@/shared-metadata'

const getDetail = cache((id: number) =>
  wrapServerApi(() => dishApiRequest.getDish(id)),
)

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'DishDetail',
  })
  const id = getIdFromSlugUrl(params.slug)
  const data = await getDetail(id)
  const dish = data?.payload.data
  if (!dish) {
    return {
      title: t('notFound'),
      description: t('notFound'),
    }
  }
  const url =
    envConfig.NEXT_PUBLIC_URL +
    `/${params.locale}/dishes/${generateSlugUrl({
      name: dish.name,
      id: dish.id,
    })}`

  return {
    title: dish.name,
    description: htmlToTextForDescription(dish.description),
    openGraph: {
      ...baseOpenGraph,
      title: dish.name,
      description: dish.description,
      url,
      images: [
        {
          url: dish.image,
        },
      ],
    },
    alternates: {
      canonical: url,
    },
  }
}

const DishPage = async (props: {
  params: Promise<{
    slug: string
    locale: string
  }>
}) => {
  const params = await props.params

  const { slug, locale } = params

  setRequestLocale(locale)

  const id = getIdFromSlugUrl(slug)
  const data = await getDetail(id)
  const dish = data?.payload?.data

  return <DishDetail dish={dish} />
}

export default DishPage
