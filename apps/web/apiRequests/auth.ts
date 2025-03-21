import http from '@/lib/http'
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from '@/schemaValidations/auth.schema'

const prefix = 'auth'

const authApiRequests = {
  refreshTokenRequest: null as Promise<{
    status: number
    payload: RefreshTokenResType
  }> | null,
  sLogin: (body: LoginBodyType) =>
    http.post<LoginResType>(`/${prefix}/login`, body),
  login: (body: LoginBodyType) =>
    http.post<LoginResType>(`/${prefix}/login`, body, {
      baseUrl: '/api',
    }),
  sLogout: (
    body: LogoutBodyType & {
      accessToken: string
    },
  ) =>
    http.post(
      `/${prefix}/logout`,
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      },
    ),
  logout: () => http.post(`/${prefix}/logout`, null, { baseUrl: '/api' }),
  sRefreshToken: (body: RefreshTokenBodyType) =>
    http.post<RefreshTokenResType>(`/${prefix}/refresh-token`, body),
  async refreshToken() {
    if (this.refreshTokenRequest) {
      return this.refreshTokenRequest
    }
    this.refreshTokenRequest = http.post<RefreshTokenResType>(
      `/${prefix}/refresh-token`,
      null,
      {
        baseUrl: '/api',
      },
    )
    const result = await this.refreshTokenRequest
    this.refreshTokenRequest = null
    return result
  },
  setTokenToCookie: (body: { accessToken: string; refreshToken: string }) =>
    http.post(`/${prefix}/token`, body, { baseUrl: '/api' }),
}

export default authApiRequests
