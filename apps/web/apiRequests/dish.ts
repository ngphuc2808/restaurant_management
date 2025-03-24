import http from '@/lib/http'
import {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  UpdateDishBodyType,
} from '@/schemaValidations/dish.schema'
import queryString from 'query-string'

const prefix = 'dishes'

const dishApiRequest = {
  list: ({ page, limit }: { page: number; limit: number }) =>
    http.get<DishListResType>(
      `${prefix}?` + queryString.stringify({ page, limit }),
    ),
  add: (body: CreateDishBodyType) => http.post<DishResType>(prefix, body),
  getDish: (id: number) => http.get<DishResType>(`${prefix}/${id}`),
  updateDish: (id: number, body: UpdateDishBodyType) =>
    http.put<DishResType>(`${prefix}/${id}`, body),
  deleteDish: (id: number) => http.delete<DishResType>(`${prefix}/${id}`),
}

export default dishApiRequest
