import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { ChangePasswordV2BodyType } from '@/schemaValidations/account.schema'
import accountApiRequest from '@/apiRequests/account'
import { HttpError } from '@/lib/http'

export async function PUT(request: Request) {
  const locale = request.headers.get('locale')
  const cookieStore = await cookies()
  const body = (await request.json()) as ChangePasswordV2BodyType
  const accessToken = cookieStore.get('accessToken')?.value

  if (!accessToken) {
    return Response.json(
      {
        message: 'Không tìm thấy accessToken',
      },
      {
        status: 401,
      },
    )
  }
  try {
    const { payload } = await accountApiRequest.sChangePasswordV2(
      accessToken,
      body,
      locale!,
    )

    const decodedAccessToken = jwt.decode(payload.data.accessToken) as {
      exp: number
    }
    const decodedRefreshToken = jwt.decode(payload.data.refreshToken) as {
      exp: number
    }
    cookieStore.set('accessToken', payload.data.accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedAccessToken.exp * 1000,
    })
    cookieStore.set('refreshToken', payload.data.refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedRefreshToken.exp * 1000,
    })
    return Response.json(payload)
  } catch (error: any) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status,
      })
    } else {
      return Response.json(
        { message: 'Internal server error' },
        {
          status: 500,
        },
      )
    }
  }
}
