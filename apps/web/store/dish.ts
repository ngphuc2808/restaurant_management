import { create } from 'zustand'

import { DishListResType } from '@/schemaValidations/dish.schema'

type DishType = {
  setDishIdEdit: (dishIdEdit: number | undefined) => void
  dishIdEdit: number | undefined
  dishDelete: DishListResType['data']['dishes'][0] | undefined
  setDishDelete: (
    dishDelete: DishListResType['data']['dishes'][0] | undefined,
  ) => void
}

const useDish = create<DishType>((set) => ({
  setDishIdEdit: (dishIdEdit: number | undefined) => {
    set({ dishIdEdit })
  },
  dishIdEdit: undefined,
  dishDelete: undefined,
  setDishDelete: (
    dishDelete: DishListResType['data']['dishes'][0] | undefined,
  ) => {
    set({ dishDelete })
  },
}))

export default useDish
