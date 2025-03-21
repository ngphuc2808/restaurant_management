import { setRequestLocale } from 'next-intl/server'

import dishApiRequest from '@/apiRequests/dish'
import Modal from '@/app/[locale]/(public)/@modal/(.)dishes/[slug]/modal'
import DishDetail from '@/app/[locale]/(public)/dishes/[slug]/dish-detail'
import { getIdFromSlugUrl, wrapServerApi } from '@/lib/utils'

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
  const data = await wrapServerApi(() => dishApiRequest.getDish(Number(id)))

  const dish = data?.payload?.data

  return (
    <Modal>
      <DishDetail dish={dish} />
    </Modal>
  )
}

export default DishPage
