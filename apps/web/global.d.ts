import type { Socket } from 'socket.io-client'

import vi from '@/messages/vi.json'
import { RoleType } from '@/types/jwt.types'
import { Locale } from '@/config'

type Messages = typeof vi

declare global {
  interface IntlMessages extends Messages {}

  type GlobalProps = {
    params: Promise<{ number: string; slug: string; locale: Locale }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }

  type AppStoreType = {
    isAuth: boolean
    role: RoleType | undefined
    setRole: (role?: RoleType | undefined) => void
    socket: Socket | undefined
    setSocket: (socket?: Socket | undefined) => void
    disconnectSocket: () => void
  }

  type QueryResponseType<T> = {
    status: number
    payload: T
  }

  type User = {
    name: string
    email: string
    avatar: string
  }

  type BaseNavItem = {
    title: string
    badge?: string
    roles?: RoleType[]
    icon?: React.ElementType
  }

  type NavLink = BaseNavItem & {
    url: string
    items?: never
  }

  type NavCollapsible = BaseNavItem & {
    items: (BaseNavItem & { url: string })[]
    url?: never
  }

  type NavItem = NavCollapsible | NavLink

  type NavGroupType = {
    title: string
    items: NavItem[]
  }

  type SidebarData = {
    user: User
    navGroups: NavGroupType[]
  }
}

export {}
