import { Metadata } from 'next'
import { Suspense } from 'react'

import RefreshToken from '@/app/[locale]/(public)/(auth)/refresh-token/refresh-token'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params

  const { locale } = params

  const t = await getTranslations({ locale, namespace: 'RefreshToken' })

  return {
    title: t('title'),
    robots: {
      index: false,
    },
  }
}

const RefreshTokenPage = () => {
  return (
    <Suspense fallback={null}>
      <RefreshToken />
    </Suspense>
  )
}

export default RefreshTokenPage
