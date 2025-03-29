import http from '@/lib/http'
import {
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from '@/schemaValidations/auth.schema'
import {
  GuestCreateOrdersBodyType,
  GuestCreateOrdersResType,
  GuestGetOrdersResType,
  GuestLoginBodyType,
  GuestLoginResType,
} from '@/schemaValidations/guest.schema'

const prefix = 'guest'

const guestApiRequest = {
  refreshTokenRequest: null as Promise<{
    status: number
    payload: RefreshTokenResType
  }> | null,
  sLogin: (body: GuestLoginBodyType, locale: string) =>
    http.post<GuestLoginResType>(`/${prefix}/auth/login`, body, {
      headers: {
        locale,
      },
    }),
  login: (body: GuestLoginBodyType) =>
    http.post<GuestLoginResType>(`/${prefix}/auth/login`, body, {
      baseUrl: '/api',
    }),
  sLogout: (
    body: {
      accessToken: string
    },
    locale: string,
  ) =>
    http.post(`/${prefix}/auth/logout`, null, {
      headers: {
        Authorization: `Bearer ${body.accessToken}`,
        locale,
      },
    }),
  logout: () => http.post(`/${prefix}/auth/logout`, null, { baseUrl: '/api' }),
  sRefreshToken: (body: RefreshTokenBodyType, locale: string) =>
    http.post<RefreshTokenResType>(`/${prefix}/auth/refresh-token`, body, {
      headers: {
        locale,
      },
    }),
  async refreshToken() {
    if (this.refreshTokenRequest) {
      return this.refreshTokenRequest
    }
    this.refreshTokenRequest = http.post<RefreshTokenResType>(
      `/${prefix}/auth/refresh-token`,
      null,
      {
        baseUrl: '/api',
      },
    )
    const result = await this.refreshTokenRequest
    this.refreshTokenRequest = null
    return result
  },
  order: (body: GuestCreateOrdersBodyType) =>
    http.post<GuestCreateOrdersResType>(`/${prefix}/orders`, body),
  getOrderList: () => http.get<GuestGetOrdersResType>(`/${prefix}/orders`),
}

export default guestApiRequest
