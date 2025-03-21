'use client'

import { ReactNode, useEffect, useRef } from 'react'
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import useAppStore from '@/store/app'
import RefreshToken from '@/components/atoms/refresh-token'
import ListenLogoutSocket from '@/components/atoms/listen-logout-socket'
import {
  decodeToken,
  generateSocketInstace,
  getAccessTokenFromLocalStorage,
} from '@/lib/utils'

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

const getQueryClient = () => {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

type Props = {
  children: ReactNode
}

const AppProvider = ({ children }: Props) => {
  const queryClient = getQueryClient()
  const { setRole, setSocket } = useAppStore()

  const count = useRef(0)

  useEffect(() => {
    if (count.current === 0) {
      const accessToken = getAccessTokenFromLocalStorage()
      if (accessToken) {
        const { role } = decodeToken(accessToken)
        setRole(role)
        setSocket(generateSocketInstace(accessToken))
      }
      count.current++
    }
  }, [setRole, setSocket])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <RefreshToken />
      <ListenLogoutSocket />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default AppProvider
