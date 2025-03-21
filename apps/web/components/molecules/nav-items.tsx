'use client'

import { useTranslations } from 'next-intl'

import { useRouter, Link } from '@/i18n/routing'
import useAppStore from '@/store/app'
import { useLogoutMutation } from '@/queries/useAuth'
import { useGuestLogoutMutation } from '@/queries/useGuest'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog'
import { cn } from '@repo/ui/lib/utils'
import { menuItemsHomePage } from '@/constants'
import { Role } from '@/constants/type'
import { handleErrorApi } from '@/lib/utils'

const NavItems = ({ className }: { className?: string }) => {
  const { role, setRole, disconnectSocket } = useAppStore()

  const t = useTranslations('NavItems')
  const tAll = useTranslations('All')

  const router = useRouter()

  const logoutMutation = useLogoutMutation()
  const logoutGuestMutation = useGuestLogoutMutation()

  const logout = async () => {
    try {
      if (role !== Role.Guest) {
        if (logoutMutation.isPending) return
        await logoutMutation.mutateAsync()
      } else {
        if (logoutGuestMutation.isPending) return
        await logoutGuestMutation.mutateAsync()
      }
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
    <>
      {menuItemsHomePage.map((item) => {
        const isAuth = item.roles && role && item.roles.includes(role)
        const canShow =
          (!item.roles && !item.hideWhenLogin) || (!role && item.hideWhenLogin)
        if (isAuth || canShow) {
          return (
            <Link href={item.href} key={item.href} className={className}>
              {t(item.title as any)}
            </Link>
          )
        }
        return null
      })}
      {role && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className={cn(className, 'cursor-pointer')}>{t('logout')}</div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('logoutDialog.logoutQuestion')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('logoutDialog.logoutConfirm')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tAll('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>
                {tAll('confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}

export default NavItems
