import queryString from 'query-string'

import http from '@/lib/http'
import {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType,
} from '@/schemaValidations/order.schema'

const prefix = 'orders'

const orderApiRequest = {
  createOrders: (body: CreateOrdersBodyType) =>
    http.post<CreateOrdersResType>(prefix, body),
  getOrderList: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      `/${prefix}?` +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
          page: queryParams.page,
          limit: queryParams.limit,
        }),
    ),
  updateOrder: (orderId: number, body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`/${prefix}/${orderId}`, body),
  getOrderDetail: (orderId: number) =>
    http.get<GetOrderDetailResType>(`/${prefix}/${orderId}`),
  pay: (body: PayGuestOrdersBodyType) =>
    http.post<PayGuestOrdersResType>(`/${prefix}/pay`, body),
}

export default orderApiRequest
