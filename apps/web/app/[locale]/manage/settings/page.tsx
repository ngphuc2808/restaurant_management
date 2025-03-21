import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import ChangePasswordForm from '@/app/[locale]/manage/settings/change-password-form'
import UpdateProfileForm from '@/app/[locale]/manage/settings/update-profile-form'
import { htmlToTextForDescription } from '@/lib/server-utils'
import { envConfig } from '@/config'

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'Settings',
  })

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/manage/settings`

  return {
    title: t('title'),
    description: htmlToTextForDescription(t('description')),
    alternates: {
      canonical: url,
    },
    robots: {
      index: false,
    },
  }
}

const SettingPage = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params
  const { locale } = params

  setRequestLocale(locale)

  const t = await getTranslations('Settings')

  return (
    <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {t('title')}
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8">
        <UpdateProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  )
}

export default SettingPage
