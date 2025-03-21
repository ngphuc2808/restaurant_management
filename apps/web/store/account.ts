import { AccountListResType } from '@/schemaValidations/account.schema'
import { create } from 'zustand'

type AccountType = {
  setEmployeeIdEdit: (employeeIdEdit: number | undefined) => void
  employeeIdEdit: number | undefined
  employeeDelete: AccountListResType['data'][0] | undefined
  setEmployeeDelete: (
    employeeDelete: AccountListResType['data'][0] | undefined,
  ) => void
}

const useAccount = create<AccountType>((set) => ({
  setEmployeeIdEdit: (employeeIdEdit: number | undefined) => {
    set({ employeeIdEdit })
  },
  employeeIdEdit: undefined,
  employeeDelete: undefined,
  setEmployeeDelete: (
    employeeDelete: AccountListResType['data'][0] | undefined,
  ) => {
    set({ employeeDelete })
  },
}))

export default useAccount
