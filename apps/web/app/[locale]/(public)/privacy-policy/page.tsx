import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params

  const { locale } = params

  const t = await getTranslations({ locale, namespace: 'PrivacyPolicy' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

const PrivacyPolicyPage = async (props: {
  params: Promise<{ locale: string }>
}) => {
  const params = await props.params
  const { locale } = params

  setRequestLocale(locale)

  const t = await getTranslations('PrivacyPolicy')

  return (
    <div className="flex flex-col">
      <section className="bg-secondary  px-4 py-20 md:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            {t('title')}
          </h1>
        </div>
      </section>
      <section className="py-12 md:py-20 lg:py-24">
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-bold">{t('dataCollected')}</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              {t('dataCollectedDescription')}
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">{t('purposeOfUse')}</h2>
            <p className=" leading-8 text-muted-foreground">
              {t('purposeOfUseDescription.title')}
            </p>
            <ul className="space-y-4 leading-8 text-muted-foreground">
              <li>{t('purposeOfUseDescription.item1')}</li>
              <li>{t('purposeOfUseDescription.item2')}</li>
              <li>{t('purposeOfUseDescription.item3')}</li>
              <li>{t('purposeOfUseDescription.item4')}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicyPage
