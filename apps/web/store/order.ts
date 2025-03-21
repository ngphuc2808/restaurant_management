import { create } from 'zustand'

type OrderTableStore = {
  orderIdEdit: number | undefined
  setOrderIdEdit: (orderIdEdit: number | undefined) => void
}

const useOrderTable = create<OrderTableStore>((set) => ({
  orderIdEdit: undefined,
  setOrderIdEdit: (orderIdEdit: number | undefined) => {
    set({ orderIdEdit })
  },
}))

export default useOrderTable
