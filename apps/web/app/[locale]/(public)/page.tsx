export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { cache } from 'react'

import { Link } from '@/i18n/routing'
import dishApiRequest from '@/apiRequests/dish'
import { formatCurrency, generateSlugUrl, wrapServerApi } from '@/lib/utils'
import { htmlToTextForDescription } from '@/lib/server-utils'
import { envConfig } from '@/config'
import { baseOpenGraph } from '@/shared-metadata'

const getDishList = cache(() =>
  wrapServerApi(() => dishApiRequest.list({ page: 1, limit: 12 })),
)

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params

  const { locale } = params

  const t = await getTranslations({ locale, namespace: 'HomePage' })

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}`

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
  }
}

const HomePage = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params
  const { locale } = params

  setRequestLocale(locale)

  const t = await getTranslations('HomePage')
  const tAll = await getTranslations('All')

  const dishList = await getDishList()

  return (
    <div className="w-full space-y-4">
      <section className="relative z-10">
        <span className="absolute left-0 top-0 z-10 h-full w-full bg-black opacity-50"></span>
        <Image
          src="/banner.png"
          width={400}
          height={200}
          quality={80}
          loading="lazy"
          alt="Banner"
          className="absolute left-0 top-0 h-full w-full object-cover"
        />
        <div className="relative z-20 px-4 py-10 sm:px-10 md:px-20 md:py-20">
          <h1 className="text-center text-xl font-bold sm:text-2xl md:text-4xl lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-center text-sm sm:text-base">{t('slogan')}</p>
        </div>
      </section>
      <section className="space-y-10 py-16">
        <h2 className="text-center text-2xl font-bold">
          {t('aVarietyOfDishes')}
        </h2>
        {dishList && dishList?.payload?.data.dishes?.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            {dishList?.payload?.data.dishes.map((dish) => (
              <Link
                href={`/dishes/${generateSlugUrl({
                  name: dish.name,
                  id: dish.id,
                })}`}
                className="w flex gap-4"
                key={dish.id}
              >
                <div className="flex-shrink-0">
                  <Image
                    src={dish.image}
                    width={150}
                    height={150}
                    quality={80}
                    loading="lazy"
                    alt={dish.name}
                    className="h-[150px] w-[150px] rounded-md object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{dish.name}</h3>
                  <p className="">{dish.description}</p>
                  <p className="font-semibold">{formatCurrency(dish.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center">{tAll('noData')}</p>
        )}
      </section>
    </div>
  )
}

export default HomePage
