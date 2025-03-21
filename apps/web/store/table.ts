import { create } from 'zustand'

import { TableListResType } from '@/schemaValidations/table.schema'

type TableType = {
  setTableIdEdit: (tableIdEdit: number | undefined) => void
  tableIdEdit: number | undefined
  tableDelete: TableListResType['data'][0] | undefined
  setTableDelete: (tableDelete: TableListResType['data'][0] | undefined) => void
}

const useTable = create<TableType>((set) => ({
  setTableIdEdit: (tableIdEdit: number | undefined) => {
    set({ tableIdEdit })
  },
  tableIdEdit: undefined,
  tableDelete: undefined,
  setTableDelete: (tableDelete: TableListResType['data'][0] | undefined) => {
    set({ tableDelete })
  },
}))

export default useTable
