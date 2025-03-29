import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import tableApiRequest from '@/apiRequests/table'
import {
  CreateTableBodyType,
  TableListResType,
  TableResType,
  UpdateTableBodyType,
} from '@/schemaValidations/table.schema'

export const useTableListQuery = (
  key: string,
  page: number,
  limit: number,
): UseQueryResult<QueryResponseType<TableListResType>, Error> => {
  return useQuery({
    queryKey: ['tables', key, page, limit],
    queryFn: () => tableApiRequest.list({ page, limit }),
  })
}

export const useGetTableQuery = ({
  id,
  enabled,
}: {
  id: number
  enabled: boolean
}): UseQueryResult<QueryResponseType<TableResType>, Error> => {
  return useQuery({
    queryKey: ['tables', id],
    queryFn: () => tableApiRequest.getTable(id),
    enabled,
  })
}

export const useAddTableMutation = (): UseMutationResult<
  QueryResponseType<TableResType>,
  Error,
  CreateTableBodyType,
  unknown
> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: tableApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tables'],
      })
    },
  })
}

export const useUpdateTableMutation = (): UseMutationResult<
  QueryResponseType<TableResType>,
  Error,
  UpdateTableBodyType & { id: number },
  unknown
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateTableBodyType & { id: number }) =>
      tableApiRequest.updateTable(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tables'],
      })
    },
  })
}

export const useDeleteTableMutation = (): UseMutationResult<
  QueryResponseType<TableResType>,
  Error,
  number,
  unknown
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tableApiRequest.deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tables'],
      })
    },
  })
}
