import { UseFormSetError } from 'react-hook-form'
import { io } from 'socket.io-client'
import { jwtDecode } from 'jwt-decode'
import { format } from 'date-fns'
import slugify from 'slugify'

import guestApiRequest from '@/apiRequests/guest'
import authApiRequests from '@/apiRequests/auth'
import { envConfig } from '@/config'
import { EntityError } from '@/lib/http'
import { toast } from '@repo/ui/hooks/use-toast'
import { DishStatus, OrderStatus, Role, TableStatus } from '@/constants/type'
import { TokenPayload } from '@/types/jwt.types'

export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path
}

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any
  setError?: UseFormSetError<any>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: 'server',
        message: item.message,
      })
    })
  } else {
    toast({
      title: 'Lỗi',
      description: error?.payload?.message ?? 'Lỗi không xác định',
      variant: 'destructive',
      duration: duration ?? 2000,
    })
  }
}

const isBrowser = typeof window !== 'undefined'

export const getAccessTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem('accessToken') : null

export const getRefreshTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem('refreshToken') : null
export const setAccessTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem('accessToken', value)

export const setRefreshTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem('refreshToken', value)

export const removeTokensFromLocalStorage = () => {
  isBrowser && localStorage.removeItem('accessToken')
  isBrowser && localStorage.removeItem('refreshToken')
}

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(number)
}

export const getVietnameseRole = (
  role: Exclude<(typeof Role)[keyof typeof Role], typeof Role.Guest>,
) => {
  switch (role) {
    case Role.Owner:
      return 'owner'
    default:
      return 'employee'
  }
}

export const getVietnameseDishStatus = (
  status: (typeof DishStatus)[keyof typeof DishStatus],
) => {
  switch (status) {
    case DishStatus.Available:
      return 'available'
    case DishStatus.Unavailable:
      return 'notAvailable'
    default:
      return 'hidden'
  }
}

export const getVietnameseTableStatus = (
  status: (typeof TableStatus)[keyof typeof TableStatus],
) => {
  switch (status) {
    case TableStatus.Available:
      return 'available'
    case TableStatus.Reserved:
      return 'reserved'
    default:
      return 'hidden'
  }
}

export const getVietnameseOrderStatus = (
  status: (typeof OrderStatus)[keyof typeof OrderStatus],
) => {
  switch (status) {
    case OrderStatus.Delivered:
      return 'delivered'
    case OrderStatus.Paid:
      return 'paid'
    case OrderStatus.Pending:
      return 'pending'
    case OrderStatus.Processing:
      return 'processing'
    default:
      return 'rejected'
  }
}

export const getTableLink = ({
  locale,
  token,
  tableNumber,
}: {
  locale: string
  token: string
  tableNumber: number
}) => {
  return (
    envConfig.NEXT_PUBLIC_URL +
    `/${locale}/tables/` +
    tableNumber +
    '?token=' +
    token
  )
}

export const decodeToken = (token: string) => {
  return jwtDecode(token) as TokenPayload
}

export const checkAndRefreshToken = async (param?: {
  onError?: () => void
  onSuccess?: () => void
  force?: boolean
}) => {
  const accessToken = getAccessTokenFromLocalStorage()
  const refreshToken = getRefreshTokenFromLocalStorage()

  if (!accessToken || !refreshToken) return
  const decodedAccessToken = decodeToken(accessToken)
  const decodedRefreshToken = decodeToken(refreshToken)

  const now = new Date().getTime() / 1000 - 1

  if (decodedRefreshToken.exp <= now) {
    removeTokensFromLocalStorage()
    return param?.onError && param.onError()
  }

  if (
    param?.force ||
    decodedAccessToken.exp - now <
      (decodedAccessToken.exp - decodedAccessToken.iat) / 3
  ) {
    try {
      const { role } = decodedRefreshToken
      const res =
        role === Role.Guest
          ? await guestApiRequest.refreshToken()
          : await authApiRequests.refreshToken()
      setAccessTokenToLocalStorage(res.payload.data.accessToken)
      setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
      param?.onSuccess && param.onSuccess()
    } catch (error) {
      console.log('>>> error: ', error)
      param?.onError && param.onError()
    }
  }
}

export const removeAccents = (str: string) => {
  const accentsMap = [
    'aàảãáạăằẳẵắặâầẩẫấậ',
    'AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ',
    'dđ',
    'DĐ',
    'eèẻẽéẹêềểễếệ',
    'EÈẺẼÉẸÊỀỂỄẾỆ',
    'iìỉĩíị',
    'IÌỈĨÍỊ',
    'oòỏõóọôồổỗốộơờởỡớợ',
    'OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ',
    'uùủũúụưừửữứự',
    'UÙỦŨÚỤƯỪỬỮỨỰ',
    'yỳỷỹýỵ',
    'YỲỶỸÝỴ',
  ]

  for (let i = 0; i < accentsMap.length; i++) {
    const re = new RegExp('[' + accentsMap[i]!.substring(1) + ']', 'g')
    const char = accentsMap[i]![0]
    str = str.replace(re, char!)
  }
  return str
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(
    removeAccents(matchText.trim().toLowerCase()),
  )
}

export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(
    date instanceof Date ? date : new Date(date),
    'HH:mm:ss dd/MM/yyyy',
  )
}

export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss')
}

export const checkIsActive = (href: string, item: NavItem, mainNav = false) => {
  return (
    href === item.url ||
    href.split('?')[0] === item.url ||
    !!item?.items?.filter((i) => i.url === href).length ||
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.url?.split('/')[1])
  )
}

export const generateSocketInstace = (accessToken: string) => {
  return io(envConfig.NEXT_PUBLIC_API_ENDPOINT_SOCKET, {
    auth: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export const wrapServerApi = async <T>(fn: () => Promise<T>) => {
  let result = null
  try {
    result = await fn()
  } catch (error: any) {
    if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
  }
  return result
}

export const generateSlugUrl = ({ name, id }: { name: string; id: number }) => {
  return `${slugify(name)}-i.${id}`
}

export const getIdFromSlugUrl = (slug: string) => {
  return Number(slug.split('-i.')[1])
}

export const checkMessageFromResponse = (type: string) => {
  if (type === 'server') {
    return true
  }
  return false
}
