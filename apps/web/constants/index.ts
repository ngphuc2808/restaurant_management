import {
  Home,
  LayoutDashboard,
  ShoppingCart,
  Users2,
  Salad,
  Table,
  Settings,
} from 'lucide-react'

import { Role } from '@/constants/type'
import { RoleType } from '@/types/jwt.types'

export const TIMEOUT = 1000
export const UNAUTHENTICATED_PATH = ['/login', '/logout', '/refresh-token']

export const menuItemsHomePage: {
  title: string
  href: string
  roles?: RoleType[]
  hideWhenLogin?: boolean
}[] = [
  {
    title: 'home',
    href: '/',
  },
  {
    title: 'menu',
    href: '/guest/menu',
    roles: [Role.Guest],
  },
  {
    title: 'orders',
    href: '/guest/orders',
    roles: [Role.Guest],
  },
  {
    title: 'login',
    href: '/login',
    hideWhenLogin: true,
  },
  {
    title: 'manage',
    href: '/manage/dashboard',
    roles: [Role.Owner],
  },
  {
    title: 'orders',
    href: '/manage/orders',
    roles: [Role.Employee],
  },
]

export const menuItems = {
  navGroups: [
    {
      title: 'general',
      items: [
        {
          title: 'home',
          icon: Home,
          url: '/',
          roles: [Role.Owner, Role.Employee],
        },
        {
          title: 'dashboard',
          icon: LayoutDashboard,
          url: '/manage/dashboard',
          roles: [Role.Owner],
        },
        {
          title: 'orders',
          icon: ShoppingCart,
          url: '/manage/orders',
          roles: [Role.Owner, Role.Employee],
        },
        {
          title: 'tables',
          icon: Table,
          url: '/manage/tables',
          roles: [Role.Owner, Role.Employee],
        },
        {
          title: 'dishes',
          icon: Salad,
          url: '/manage/dishes',
          roles: [Role.Owner, Role.Employee],
        },
        {
          title: 'accounts',
          icon: Users2,
          url: '/manage/accounts',
          roles: [Role.Owner],
        },
      ],
    },
    {
      title: 'others',
      items: [
        {
          title: 'settings',
          icon: Settings,
          url: '/manage/settings',
        },
      ],
    },
  ],
}
