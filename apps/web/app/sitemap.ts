import type { MetadataRoute } from 'next'

// import dishApiRequest from '@/apiRequests/dish'
// import { generateSlugUrl } from '@/lib/utils'
// import { envConfig, locales } from '@/config'

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: '',
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: '/login',
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.5,
  },
]

export default function sitemap(): MetadataRoute.Sitemap {
  // const result = await dishApiRequest.list({ page: 1, limit: 12 })

  // const dishList = result.payload.data.dishes
  // const localizeStaticSiteMap = locales.reduce((acc, locale) => {
  //   return [
  //     ...acc,
  //     ...staticRoutes.map((route) => {
  //       return {
  //         ...route,
  //         url: `${envConfig.NEXT_PUBLIC_URL}/${locale}${route.url}`,
  //         lastModified: new Date(),
  //       }
  //     }),
  //   ]
  // }, [] as MetadataRoute.Sitemap)
  // const localizeDishSiteMap = locales.reduce((acc, locale) => {
  //   const dishListSiteMap: MetadataRoute.Sitemap = dishList.map((dish) => {
  //     return {
  //       url: `${envConfig.NEXT_PUBLIC_URL}/${locale}/dishes/${generateSlugUrl({
  //         id: dish.id,
  //         name: dish.name,
  //       })}`,
  //       lastModified: dish.updatedAt,
  //       changeFrequency: 'weekly',
  //       priority: 0.9,
  //     }
  //   })
  //   return [...acc, ...dishListSiteMap]
  // }, [] as MetadataRoute.Sitemap)
  // return [...localizeStaticSiteMap, ...localizeDishSiteMap]

  return staticRoutes
}
