import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

import guestApiRequest from '@/apiRequests/guest'

export async function POST(request: Request) {
  const locale = request.headers.get('locale')
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refreshToken')?.value

  if (!refreshToken) {
    return Response.json(
      {
        message: 'Không tìm thấy refreshToken',
      },
      {
        status: 401,
      },
    )
  }
  try {
    const { payload } = await guestApiRequest.sRefreshToken(
      {
        refreshToken,
      },
      locale!,
    )

    const decodedAccessToken = jwt.decode(payload.data.accessToken) as {
      exp: number
    }
    const decodedRefreshToken = jwt.decode(payload.data.refreshToken) as {
      exp: number
    }

    const cookieOptions = {
      path: '/',
      httpOnly: true,
      sameSite: 'none' as const,
      secure: true,
      expires: decodedRefreshToken.exp * 1000,
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_COOKIE_DOMAIN
          : undefined,
    }

    cookieStore.set('accessToken', payload.data.accessToken, {
      ...cookieOptions,
      expires: decodedAccessToken.exp * 1000,
    })
    cookieStore.set('refreshToken', payload.data.refreshToken, cookieOptions)

    return Response.json(payload)
  } catch (error: any) {
    console.log('>>> error: ', error)
    return Response.json(
      {
        message: error.message ?? 'Có lỗi xảy ra',
      },
      {
        status: 401,
      },
    )
  }
}
