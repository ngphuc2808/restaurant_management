import http from '@/lib/http'

const prefix = 'revalidate'

const revalidateApiRequest = (tag: string) =>
  http.get(`/${prefix}?tag=${tag}`, {
    baseUrl: '/api',
  })

export default revalidateApiRequest
