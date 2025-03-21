'use client'

import { useLocale, useTranslations } from 'next-intl'
import { RefreshCcw } from 'lucide-react'

import { Button } from '@repo/ui/components/button'
import { Card } from '@repo/ui/components/card'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog'

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  const t = useTranslations('ErrorPage')
  const locale = useLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <div className="fixed inset-0 flex items-center justify-center">
          <Card className="gap-2 p-8 text-center shadow-md">
            <h1 className="mb-4 text-3xl font-bold">500</h1>
            <h3 className="mb-2 text-xl font-semibold">{t('title')}</h3>
            <p className="text-gray-500">{t('description')}</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mb-4" variant="link">
                  {t('infoTitle')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t('infoTitle')}</DialogTitle>
                  <DialogDescription>{error.message}</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Button
              onClick={reset}
              className="m-auto flex items-center justify-center gap-2"
            >
              <RefreshCcw className="h-5 w-5" />
              {t('reload')}
            </Button>
          </Card>
        </div>
      </body>
    </html>
  )
}

export default Error
