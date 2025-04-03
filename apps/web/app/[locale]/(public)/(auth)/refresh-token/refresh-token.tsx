'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import {
  checkAndRefreshToken,
  getRefreshTokenFromLocalStorage,
} from '@/lib/utils'

const RefreshToken = () => {
  const router = useRouter()

  const searchParams = useSearchParams()

  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const redirectPathname = searchParams.get('redirect')

  useEffect(() => {
    if (
      refreshTokenFromUrl &&
      refreshTokenFromUrl === getRefreshTokenFromLocalStorage()
    ) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathname || '/')
        },
      })
    } else {
      router.push('/')
    }
  }, [router, refreshTokenFromUrl, redirectPathname])

  return null
}

export default RefreshToken
