'use client'

import { useEffect } from 'react'

import { useRouter, usePathname } from '@/i18n/routing'
import useAppStore from '@/store/app'
import { checkAndRefreshToken } from '@/lib/utils'
import { TIMEOUT, UNAUTHENTICATED_PATH } from '@/constants'

const RefreshToken = () => {
  const { socket, disconnectSocket } = useAppStore()

  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return
    let interval: any = null

    const onRefreshToken = (force?: boolean) => {
      checkAndRefreshToken({
        onError: () => {
          clearInterval(interval)
          disconnectSocket()
          router.push('/login')
        },
        force,
      })
    }

    interval = setInterval(onRefreshToken, TIMEOUT)

    function onRefreshTokenSocket() {
      onRefreshToken(true)
    }

    socket?.on('refresh-token', onRefreshTokenSocket)

    return () => {
      clearInterval(interval)
      socket?.off('refresh-token', onRefreshTokenSocket)
    }
  }, [socket, disconnectSocket, pathname, router])

  return null
}

export default RefreshToken
