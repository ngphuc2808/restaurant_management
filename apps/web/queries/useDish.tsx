import {
  UseMutationResult,
  UseQueryResult,
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'

import dishApiRequest from '@/apiRequests/dish'
import {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  UpdateDishBodyType,
} from '@/schemaValidations/dish.schema'

export const useDishListQuery = (
  page: number,
  limit: number,
): UseQueryResult<QueryResponseType<DishListResType>, Error> => {
  return useQuery({
    queryKey: ['dishes', page, limit],
    queryFn: () => dishApiRequest.list({ page, limit }),
    placeholderData: keepPreviousData,
  })
}

export const useInfiniteDishesQuery = (limit: number) => {
  return useInfiniteQuery({
    queryKey: ['infinite-dishes'],
    queryFn: ({ pageParam = 1 }) =>
      dishApiRequest.list({ page: pageParam, limit }),
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.payload.data.meta.total / limit)
      const nextPage = allPages.length + 1
      return nextPage <= totalPages ? nextPage : undefined
    },
    initialPageParam: 1,
  })
}

export const useGetDishQuery = ({
  id,
  enabled,
}: {
  id: number
  enabled: boolean
}): UseQueryResult<QueryResponseType<DishResType>, Error> => {
  return useQuery({
    queryKey: ['dishes', id],
    queryFn: () => dishApiRequest.getDish(id),
    enabled,
  })
}

export const useAddDishMutation = (): UseMutationResult<
  QueryResponseType<DishResType>,
  Error,
  CreateDishBodyType,
  unknown
> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dishApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishes'],
      })
    },
  })
}

export const useUpdateDishMutation = (): UseMutationResult<
  QueryResponseType<DishResType>,
  Error,
  UpdateDishBodyType & { id: number },
  unknown
> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateDishBodyType & { id: number }) =>
      dishApiRequest.updateDish(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishes'],
      })
    },
  })
}

export const useDeleteDishMutation = (): UseMutationResult<
  QueryResponseType<DishResType>,
  Error,
  number,
  unknown
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: dishApiRequest.deleteDish,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishes'],
      })
    },
  })
}
