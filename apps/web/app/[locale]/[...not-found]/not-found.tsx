'use client'

import { useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'

import { useRouter } from '@/i18n/routing'
import { Button } from '@repo/ui/components/button'
import { Card } from '@repo/ui/components/card'

const Notfound = () => {
  const router = useRouter()

  const t = useTranslations('NotFound')
  const tAll = useTranslations('All')

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Card className="p-8 text-center shadow-md">
        <h1 className="mb-4 text-3xl font-bold">404</h1>
        <h3 className="mb-2 text-xl font-semibold">{t('title')}</h3>
        <p className="mb-6 text-gray-500">{t('description')}</p>
        <Button
          onClick={() => router.push('/')}
          className="m-auto flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          {tAll('back')}
        </Button>
      </Card>
    </div>
  )
}

export default Notfound
