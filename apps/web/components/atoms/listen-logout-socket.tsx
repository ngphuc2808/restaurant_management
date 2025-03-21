'use client'

import { useEffect } from 'react'

import { useRouter, usePathname } from '@/i18n/routing'
import useAppStore from '@/store/app'
import { useLogoutMutation } from '@/queries/useAuth'
import { handleErrorApi } from '@/lib/utils'
import { UNAUTHENTICATED_PATH } from '@/constants'

const ListenLogoutSocket = () => {
  const { setRole, socket, disconnectSocket } = useAppStore()

  const pathname = usePathname()
  const router = useRouter()

  const { isPending, mutateAsync } = useLogoutMutation()

  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return

    async function onLogout() {
      if (isPending) return
      try {
        await mutateAsync()
        setRole(undefined)
        disconnectSocket()
        router.push('/')
      } catch (error: any) {
        handleErrorApi({
          error,
        })
      }
    }

    socket?.on('logout', onLogout)
    return () => {
      socket?.off('logout', onLogout)
    }
  }, [
    socket,
    disconnectSocket,
    pathname,
    setRole,
    router,
    isPending,
    mutateAsync,
  ])

  return null
}

export default ListenLogoutSocket
