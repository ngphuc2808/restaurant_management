'use client'

import { useSearchParams } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import { memo, Suspense, useEffect, useRef } from 'react'

import { useRouter } from '@/i18n/routing'
import { useLogoutMutation } from '@/queries/useAuth'
import useAppStore from '@/store/app'
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
} from '@/lib/utils'

const Logout = () => {
  const { mutateAsync } = useLogoutMutation()
  const router = useRouter()
  const disconnectSocket = useAppStore((state) => state.disconnectSocket)
  const setRole = useAppStore((state) => state.setRole)
  const searchParams = useSearchParams()
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const accessTokenFromUrl = searchParams.get('accessToken')
  const ref = useRef<boolean>(false)

  useEffect(() => {
    if (
      !ref.current &&
      ((refreshTokenFromUrl &&
        refreshTokenFromUrl === getRefreshTokenFromLocalStorage()) ||
        (accessTokenFromUrl &&
          accessTokenFromUrl === getAccessTokenFromLocalStorage()))
    ) {
      ref.current = true
      mutateAsync().then(() => {
        setTimeout(() => {
          ref.current = false
        }, 1000)
        setRole()
        disconnectSocket()
      })
    } else if (accessTokenFromUrl !== getAccessTokenFromLocalStorage()) {
      router.push('/')
    }
  }, [
    mutateAsync,
    router,
    refreshTokenFromUrl,
    accessTokenFromUrl,
    setRole,
    disconnectSocket,
  ])

  return null
}

const LogoutPage = memo(function LogoutInner() {
  return (
    <Suspense
      fallback={<LoaderCircle size={28} className="m-auto animate-spin" />}
    >
      <Logout />
    </Suspense>
  )
})

export default LogoutPage
