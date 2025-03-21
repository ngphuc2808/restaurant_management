import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { htmlToTextForDescription } from '@/lib/server-utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card'
import DishTable from '@/app/[locale]/manage/dishes/dish-table'
import { envConfig } from '@/config'

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'Dishes',
  })

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/manage/dishes`

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

const DishesPage = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params
  const { locale } = params

  setRequestLocale(locale)

  const t = await getTranslations('Dishes')

  return (
    <div className="space-y-2">
      <Card x-chunk="dashboard-06-chunk-0">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DishTable />
        </CardContent>
      </Card>
    </div>
  )
}

export default DishesPage
