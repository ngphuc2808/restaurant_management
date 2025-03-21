import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export async function generateMetadata(props: GlobalProps): Promise<Metadata> {
  const params = await props.params

  const { locale } = params

  const t = await getTranslations({ locale, namespace: 'About' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

const AboutPage = async (props: { params: Promise<{ locale: string }> }) => {
  const params = await props.params
  const { locale } = params

  setRequestLocale(locale)

  const t = await getTranslations('About')

  return (
    <div className="flex flex-col">
      <section className="bg-secondary  px-4 py-20 md:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            {t('slogan')}
          </h1>
          <p className="mt-4 text-lg md:text-xl">{t('address')}</p>
        </div>
      </section>
      <section className="py-12 md:py-20 lg:py-24">
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-bold">{t('ourStory')}</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              {t('ourStoryDescription')}
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">{t('ourValue')}</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              {t('ourValueDescription')}
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">{t('ourCommitment')}</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              {t('ourCommitmentDescription')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
