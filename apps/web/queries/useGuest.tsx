import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query'

import guestApiRequest from '@/apiRequests/guest'
import {
  GuestCreateOrdersBodyType,
  GuestCreateOrdersResType,
  GuestGetOrdersResType,
  GuestLoginBodyType,
  GuestLoginResType,
} from '@/schemaValidations/guest.schema'

export const useGuestLoginMutation = (): UseMutationResult<
  QueryResponseType<GuestLoginResType>,
  Error,
  GuestLoginBodyType,
  unknown
> => {
  return useMutation({
    mutationFn: guestApiRequest.login,
  })
}

export const useGuestLogoutMutation = (): UseMutationResult<
  QueryResponseType<unknown>,
  Error,
  void,
  unknown
> => {
  return useMutation({
    mutationFn: guestApiRequest.logout,
  })
}

export const useGuestOrderMutation = (): UseMutationResult<
  QueryResponseType<GuestCreateOrdersResType>,
  Error,
  GuestCreateOrdersBodyType,
  unknown
> => {
  return useMutation({
    mutationFn: guestApiRequest.order,
  })
}

export const useGuestGetOrderListQuery = (): UseQueryResult<
  QueryResponseType<GuestGetOrdersResType>,
  Error
> => {
  return useQuery({
    queryFn: guestApiRequest.getOrderList,
    queryKey: ['guest-orders'],
  })
}
