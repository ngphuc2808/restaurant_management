'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'

import { useRouter } from '@/i18n/routing'
import useAppStore from '@/store/app'
import { useSetTokenToCookieMutation } from '@/queries/useAuth'
import { decodeToken, generateSocketInstace } from '@/lib/utils'
import { toast } from '@repo/ui/hooks/use-toast'

const Oauth = () => {
  const { setRole, setSocket } = useAppStore()
  const { mutateAsync } = useSetTokenToCookieMutation()
  const router = useRouter()
  const count = useRef(0)

  const tAll = useTranslations('All')

  const searchParams = useSearchParams()

  const accessToken = searchParams.get('accessToken')
  const refreshToken = searchParams.get('refreshToken')
  const message = searchParams.get('message')

  useEffect(() => {
    if (accessToken && refreshToken) {
      if (count.current === 0) {
        const { role } = decodeToken(accessToken)
        mutateAsync({ accessToken, refreshToken })
          .then(() => {
            setRole(role)
            setSocket(generateSocketInstace(accessToken))
            router.push('/manage/dashboard')
          })
          .catch((e) => {
            toast({
              description: e.message || tAll('error'),
            })
          })
        count.current++
      }
    } else {
      if (count.current === 0) {
        setTimeout(() => {
          toast({
            description: message || tAll('error'),
          })
        })
        count.current++
        router.push('/login')
      }
    }
  }, [
    accessToken,
    refreshToken,
    setRole,
    router,
    setSocket,
    message,
    mutateAsync,
  ])

  return null
}

export default Oauth
