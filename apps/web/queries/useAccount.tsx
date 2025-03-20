import {
  useMutation,
  useQuery,
  UseQueryResult,
  UseMutationResult,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import accountApiRequest from "@/apiRequests/account";
import {
  AccountListResType,
  AccountResType,
  ChangePasswordV2BodyType,
  ChangePasswordV2ResType,
  CreateEmployeeAccountBodyType,
  CreateGuestBodyType,
  CreateGuestResType,
  GetGuestListQueryParamsType,
  GetListGuestsResType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";

export const useAccountMe = (): UseQueryResult<
  QueryResponseType<AccountResType>,
  Error
> => {
  return useQuery({
    queryKey: ["account-me"],
    queryFn: accountApiRequest.me,
  });
};

export const useUpdateMeMutation = (): UseMutationResult<
  QueryResponseType<AccountResType>,
  Error,
  UpdateMeBodyType,
  unknown
> => {
  return useMutation({
    mutationFn: accountApiRequest.updateMe,
  });
};

export const useChangePasswordMutation = (): UseMutationResult<
  QueryResponseType<ChangePasswordV2ResType>,
  Error,
  ChangePasswordV2BodyType,
  unknown
> => {
  return useMutation({
    mutationFn: accountApiRequest.changePasswordV2,
  });
};

export const useGetAccountList = (
  page: number,
  limit: number,
): UseQueryResult<QueryResponseType<AccountListResType>, Error> => {
  return useQuery({
    queryKey: ["accounts", page, limit],
    queryFn: () => accountApiRequest.list({ page, limit }),
    placeholderData: keepPreviousData,
  });
};

export const useGetAccount = ({
  id,
  enabled,
}: {
  id: number;
  enabled: boolean;
}): UseQueryResult<QueryResponseType<AccountResType>, Error> => {
  return useQuery({
    queryKey: ["accounts", id],
    queryFn: () => accountApiRequest.getEmployee(id),
    enabled,
  });
};

export const useAddAccountMutation = (): UseMutationResult<
  QueryResponseType<AccountResType>,
  Error,
  CreateEmployeeAccountBodyType,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApiRequest.addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
};

export const useUpdateAccountMutation = (): UseMutationResult<
  QueryResponseType<AccountResType>,
  Error,
  UpdateEmployeeAccountBodyType & { id: number },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: UpdateEmployeeAccountBodyType & { id: number }) =>
      accountApiRequest.updateEmployee(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
};

export const useDeleteAccountMutation = (): UseMutationResult<
  QueryResponseType<AccountResType>,
  Error,
  number,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApiRequest.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
};

export const useGetGuestListQuery = (
  queryParams: GetGuestListQueryParamsType,
): UseQueryResult<QueryResponseType<GetListGuestsResType>, Error> => {
  return useQuery({
    queryFn: () => accountApiRequest.guestList(queryParams),
    queryKey: ["guests", queryParams],
  });
};

export const useCreateGuestMutation = (): UseMutationResult<
  QueryResponseType<CreateGuestResType>,
  Error,
  CreateGuestBodyType,
  unknown
> => {
  return useMutation({
    mutationFn: accountApiRequest.createGuest,
  });
};
