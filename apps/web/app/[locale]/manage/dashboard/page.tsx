import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card'
import DashboardMain from '@/app/[locale]/manage/dashboard/dashboard-main'
import { htmlToTextForDescription } from '@/lib/server-utils'
import { envConfig } from '@/config'

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'Dashboard',
  })

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/manage/dashboard`

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

const DashboardPage = async (props: {
  params: Promise<{ locale: string }>
}) => {
  const params = await props.params
  const { locale } = params

  setRequestLocale(locale)

  const t = await getTranslations('Dashboard')

  return (
    <div className="space-y-2">
      <Card x-chunk="dashboard-06-chunk-0">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardMain />
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
