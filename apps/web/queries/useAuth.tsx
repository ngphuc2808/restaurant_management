import { useMutation, UseMutationResult } from '@tanstack/react-query'

import authApiRequests from '@/apiRequests/auth'
import { LoginBodyType, LoginResType } from '@/schemaValidations/auth.schema'

export const useLoginMutation = (): UseMutationResult<
  QueryResponseType<LoginResType>,
  Error,
  LoginBodyType,
  unknown
> => {
  return useMutation({
    mutationFn: authApiRequests.login,
  })
}

export const useLogoutMutation = (): UseMutationResult<
  QueryResponseType<unknown>,
  Error,
  void,
  unknown
> => {
  return useMutation({
    mutationFn: authApiRequests.logout,
  })
}

export const useSetTokenToCookieMutation = (): UseMutationResult<
  QueryResponseType<unknown>,
  Error,
  { accessToken: string; refreshToken: string },
  unknown
> => {
  return useMutation({
    mutationFn: authApiRequests.setTokenToCookie,
  })
}
