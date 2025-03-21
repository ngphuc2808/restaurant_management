import { useMemo } from 'react'

import { GetOrdersResType } from '@/schemaValidations/order.schema'
import {
  OrderObjectByGuestID,
  ServingGuestByTableNumber,
  Statics,
} from '@/app/[locale]/manage/orders/order-table'
import { OrderStatus } from '@/constants/type'

export const useOrderService = (orderList: GetOrdersResType['data']) => {
  const result = useMemo(() => {
    const statics: Statics = {
      status: {
        Pending: 0,
        Processing: 0,
        Delivered: 0,
        Paid: 0,
        Rejected: 0,
      },
      table: {},
    }

    const orderObjectByGuestId: OrderObjectByGuestID = {}
    const guestByTableNumber: ServingGuestByTableNumber = {}
    orderList.forEach((order) => {
      statics.status[order.status] = statics.status[order.status] + 1
      if (order.tableNumber !== null && order.guestId !== null) {
        if (!statics.table[order.tableNumber]) {
          statics.table[order.tableNumber] = {}
        }

        statics.table[order.tableNumber]![order.guestId] = {
          ...statics.table[order.tableNumber]?.[order.guestId]!,
          [order.status]:
            (statics.table[order.tableNumber]?.[order.guestId]?.[
              order.status
            ] ?? 0) + 1,
        }
      }

      if (order.guestId) {
        if (!orderObjectByGuestId[order.guestId]) {
          orderObjectByGuestId[order.guestId] = []
        }

        orderObjectByGuestId[order.guestId]!.push(order)
      }

      if (order.tableNumber && order.guestId) {
        if (!guestByTableNumber[order.tableNumber]) {
          guestByTableNumber[order.tableNumber] = {}
        }

        guestByTableNumber[order.tableNumber]![order.guestId] =
          orderObjectByGuestId[order.guestId]!
      }
    })

    const servingGuestByTableNumber: ServingGuestByTableNumber = {}
    for (const tableNumber in guestByTableNumber) {
      const guestObject = guestByTableNumber[tableNumber]!
      const servingGuestObject: OrderObjectByGuestID = {}
      for (const guestId in guestObject) {
        const guestOrders = guestObject[guestId]!
        const isServingGuest = guestOrders.some((order) =>
          [
            OrderStatus.Pending,
            OrderStatus.Processing,
            OrderStatus.Delivered,
          ].includes(order.status as any),
        )
        if (isServingGuest) {
          servingGuestObject[Number(guestId)] = guestOrders
        }
      }
      if (Object.keys(servingGuestObject).length) {
        servingGuestByTableNumber[Number(tableNumber)] = servingGuestObject
      }
    }

    return {
      statics,
      orderObjectByGuestId,
      servingGuestByTableNumber,
    }
  }, [orderList])

  return result
}
