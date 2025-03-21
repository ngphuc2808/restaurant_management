import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import dishApiRequest from '@/apiRequests/dish'
import {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  UpdateDishBodyType,
} from '@/schemaValidations/dish.schema'

export const useDishListQuery = (): UseQueryResult<
  QueryResponseType<DishListResType>,
  Error
> => {
  return useQuery({
    queryKey: ['dishes'],
    queryFn: dishApiRequest.list,
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
        exact: true,
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
