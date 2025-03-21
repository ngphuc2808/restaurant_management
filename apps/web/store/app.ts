import { create } from 'zustand'
import type { Socket } from 'socket.io-client'

import { RoleType } from '@/types/jwt.types'
import { removeTokensFromLocalStorage } from '@/lib/utils'

const useAppStore = create<AppStoreType>((set) => ({
  isAuth: false,
  role: undefined as RoleType | undefined,
  setRole: (role?: RoleType | undefined) => {
    set({ role, isAuth: Boolean(role) })
    if (!role) {
      removeTokensFromLocalStorage()
    }
  },
  socket: undefined as Socket | undefined,
  setSocket: (socket?: Socket | undefined) => set({ socket }),
  disconnectSocket: () =>
    set((state) => {
      state.socket?.disconnect()
      return { socket: undefined }
    }),
}))

export default useAppStore
