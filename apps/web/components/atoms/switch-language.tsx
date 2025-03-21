'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'

import { usePathname, useRouter } from '@/i18n/routing'
import { Locale, locales } from '@/config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu'
import { Button } from '@repo/ui/components/button'

const SwitchLanguage = () => {
  const t = useTranslations('SwitchLanguage')

  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild aria-label="locale">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
        >
          <Image
            src={`/${locale}.png`}
            alt={locale}
            height={40}
            width={40}
            quality={80}
            className="object-cover"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => {
              router.replace(pathname, {
                locale: locale as Locale,
              })
              router.refresh()
            }}
            className="cursor-pointer"
          >
            {t(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SwitchLanguage
