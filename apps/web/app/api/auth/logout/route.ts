import { cookies } from 'next/headers'

import authApiRequest from '@/apiRequests/auth'

export async function POST() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
  if (!accessToken || !refreshToken) {
    return Response.json(
      {
        message: 'Không nhận được access token hoặc refresh token',
      },
      {
        status: 200,
      },
    )
  }
  try {
    const { payload } = await authApiRequest.sLogout({
      accessToken,
      refreshToken,
    })

    return Response.json(payload)
  } catch (error) {
    return Response.json(
      {
        message: 'Lỗi khi gọi API đến server backend',
      },
      {
        status: 200,
      },
    )
  }
}
