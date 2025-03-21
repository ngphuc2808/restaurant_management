import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query'

import orderApiRequest from '@/apiRequests/order'
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

export const useUpdateOrderMutation = (): UseMutationResult<
  QueryResponseType<UpdateOrderResType>,
  Error,
  UpdateOrderBodyType & {
    orderId: number
  },
  unknown
> => {
  return useMutation({
    mutationFn: ({
      orderId,
      ...body
    }: UpdateOrderBodyType & {
      orderId: number
    }) => orderApiRequest.updateOrder(orderId, body),
  })
}

export const useGetOrderListQuery = (
  queryParams: GetOrdersQueryParamsType,
): UseQueryResult<QueryResponseType<GetOrdersResType>, Error> => {
  return useQuery({
    queryFn: () => orderApiRequest.getOrderList(queryParams),
    queryKey: ['orders', queryParams],
  })
}

export const useGetOrderDetailQuery = ({
  id,
  enabled,
}: {
  id: number
  enabled: boolean
}): UseQueryResult<QueryResponseType<GetOrderDetailResType>, Error> => {
  return useQuery({
    queryFn: () => orderApiRequest.getOrderDetail(id),
    queryKey: ['orders', id],
    enabled,
  })
}

export const usePayForGuestMutation = (): UseMutationResult<
  QueryResponseType<PayGuestOrdersResType>,
  Error,
  PayGuestOrdersBodyType,
  unknown
> => {
  return useMutation({
    mutationFn: (body: PayGuestOrdersBodyType) => orderApiRequest.pay(body),
  })
}

export const useCreateOrderMutation = (): UseMutationResult<
  QueryResponseType<CreateOrdersResType>,
  Error,
  CreateOrdersBodyType,
  unknown
> => {
  return useMutation({
    mutationFn: orderApiRequest.createOrders,
  })
}
