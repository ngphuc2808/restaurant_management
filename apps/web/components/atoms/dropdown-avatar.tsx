'use client'

import { useTranslations } from 'next-intl'
import { useRouter, Link } from '@/i18n/routing'
import useAppStore from '@/store/app'
import { useLogoutMutation } from '@/queries/useAuth'
import { useAccountMe } from '@/queries/useAccount'
import { handleErrorApi } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar'
import { Button } from '@repo/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu'

const DropdownAvatar = () => {
  const { setRole, disconnectSocket } = useAppStore()

  const t = useTranslations('Settings')

  const router = useRouter()

  const accountProfile = useAccountMe()
  const account = accountProfile.data?.payload.data

  const logoutMutation = useLogoutMutation()

  const logout = async () => {
    if (logoutMutation.isPending) return
    try {
      await logoutMutation.mutateAsync()
      setRole(undefined)
      disconnectSocket()
      router.push('/')
    } catch (error) {
      handleErrorApi({
        error,
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <Avatar>
            <AvatarImage
              src={account?.avatar ?? undefined}
              alt={account?.name}
            />
            <AvatarFallback>
              {account?.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{account?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={'/manage/settings'} className="cursor-pointer">
            {t('title')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>{t('logout')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownAvatar
