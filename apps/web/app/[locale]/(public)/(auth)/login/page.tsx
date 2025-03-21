import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { htmlToTextForDescription } from '@/lib/server-utils'
import { envConfig } from '@/config'
import { baseOpenGraph } from '@/shared-metadata'
import LoginForm from '@/app/[locale]/(public)/(auth)/login/login-form'
import Logout from '@/app/[locale]/(public)/(auth)/login/logout'

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params

  const { locale } = params

  const t = await getTranslations({ locale, namespace: 'Login' })
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/login`

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

const LoginPage = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params
  const { locale } = params

  setRequestLocale(locale)

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm />
      <Logout />
    </div>
  )
}

export default LoginPage
