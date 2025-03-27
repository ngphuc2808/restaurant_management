import queryString from 'query-string'

import http from '@/lib/http'
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
} from '@/schemaValidations/account.schema'

const prefix = 'accounts'

const accountApiRequest = {
  me: () => http.get<AccountResType>(`/${prefix}/me`),
  sMe: (accessToken: string) =>
    http.get<AccountResType>(`${prefix}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  updateMe: (body: UpdateMeBodyType) =>
    http.put<AccountResType>(`/${prefix}/me`, body),
  changePasswordV2: (body: ChangePasswordV2BodyType) =>
    http.put<ChangePasswordV2ResType>(`/${prefix}/change-password`, body, {
      baseUrl: '/api',
    }),
  sChangePasswordV2: (
    accessToken: string,
    body: ChangePasswordV2BodyType,
    locale: string,
  ) =>
    http.put<ChangePasswordV2ResType>(`/${prefix}/change-password`, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        locale,
      },
    }),
  list: ({ page, limit }: { page: number; limit: number }) =>
    http.get<AccountListResType>(
      `${prefix}?` + queryString.stringify({ page, limit }),
    ),
  addEmployee: (body: CreateEmployeeAccountBodyType) =>
    http.post<AccountResType>(prefix, body),
  updateEmployee: (id: number, body: UpdateEmployeeAccountBodyType) =>
    http.put<AccountResType>(`${prefix}/detail/${id}`, body),
  getEmployee: (id: number) =>
    http.get<AccountResType>(`${prefix}/detail/${id}`),
  deleteEmployee: (id: number) =>
    http.delete<AccountResType>(`${prefix}/detail/${id}`),
  guestList: (queryParams: GetGuestListQueryParamsType) =>
    http.get<GetListGuestsResType>(
      `${prefix}/guests?` +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        }),
    ),
  createGuest: (body: CreateGuestBodyType) =>
    http.post<CreateGuestResType>(`${prefix}/guests`, body),
}

export default accountApiRequest
