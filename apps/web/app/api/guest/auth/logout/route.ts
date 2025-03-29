import { cookies } from 'next/headers'

import guestApiRequest from '@/apiRequests/guest'

export async function POST(request: Request) {
  const locale = request.headers.get('locale')
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')

  if (!accessToken) {
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
    const result = await guestApiRequest.sLogout(
      {
        accessToken,
      },
      locale!,
    )
    return Response.json(result.payload)
  } catch (error) {
    console.log('>>> error: ', error)
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
