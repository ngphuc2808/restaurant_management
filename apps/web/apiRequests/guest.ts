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
  sLogin: (body: GuestLoginBodyType) =>
    http.post<GuestLoginResType>(`/${prefix}/auth/login`, body),
  login: (body: GuestLoginBodyType) =>
    http.post<GuestLoginResType>(`/${prefix}/auth/login`, body, {
      baseUrl: '/api',
    }),
  sLogout: (
    body: LogoutBodyType & {
      accessToken: string
    },
  ) =>
    http.post(
      `/${prefix}/auth/logout`,
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      },
    ),
  logout: () => http.post(`/${prefix}/auth/logout`, null, { baseUrl: '/api' }),
  sRefreshToken: (body: RefreshTokenBodyType) =>
    http.post<RefreshTokenResType>(`/${prefix}/auth/refresh-token`, body),
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
