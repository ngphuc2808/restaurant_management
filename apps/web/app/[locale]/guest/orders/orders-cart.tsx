'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'

import useAppStore from '@/store/app'
import {
  PayGuestOrdersResType,
  UpdateOrderResType,
} from '@/schemaValidations/order.schema'
import { useGuestGetOrderListQuery } from '@/queries/useGuest'
import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils'

import { Badge } from '@repo/ui/components/badge'
import { toast } from '@repo/ui/hooks/use-toast'
import { OrderStatus } from '@/constants/type'

const OrdersCart = () => {
  const { socket } = useAppStore()

  const t = useTranslations('GuestOrders')
  const tOrders = useTranslations('Orders')
  const tAll = useTranslations('All')

  const { data, refetch } = useGuestGetOrderListQuery()

  const orders = useMemo(() => data?.payload.data ?? [], [data])
  const { waitingForPaying, paid } = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        if (
          order.status === OrderStatus.Delivered ||
          order.status === OrderStatus.Processing ||
          order.status === OrderStatus.Pending
        ) {
          return {
            ...result,
            waitingForPaying: {
              price:
                result.waitingForPaying.price +
                order.dishSnapshot.price * order.quantity,
              quantity: result.waitingForPaying.quantity + order.quantity,
            },
          }
        }
        if (order.status === OrderStatus.Paid) {
          return {
            ...result,
            paid: {
              price:
                result.paid.price + order.dishSnapshot.price * order.quantity,
              quantity: result.paid.quantity + order.quantity,
            },
          }
        }
        return result
      },
      {
        waitingForPaying: {
          price: 0,
          quantity: 0,
        },
        paid: {
          price: 0,
          quantity: 0,
        },
      },
    )
  }, [orders])

  useEffect(() => {
    function onUpdateOrder(data: UpdateOrderResType['data']) {
      const {
        dishSnapshot: { name },
        quantity,
        status,
      } = data
      toast({
        description: tOrders('updateSocket', {
          name,
          quantity,
          status: tAll(getVietnameseOrderStatus(status)),
        }),
      })
      refetch()
    }

    function onPayment(data: PayGuestOrdersResType['data']) {
      const { guest } = data[0]!
      toast({
        description: tOrders('paymentSocket', {
          name: guest?.name,
          table: guest?.tableNumber,
          quantity: data.length,
        }),
      })
      refetch()
    }

    socket?.on('update-order', onUpdateOrder)
    socket?.on('payment', onPayment)

    return () => {
      socket?.off('update-order', onUpdateOrder)
      socket?.off('payment', onPayment)
    }
  }, [socket, refetch])

  return (
    <div className="mx-auto max-w-[400px] space-y-4">
      <h1 className="text-center text-xl font-bold">{t('title')}</h1>
      {orders.map((order, index) => (
        <div key={order.id} className="flex gap-4">
          <div className="text-sm font-semibold">{index + 1}</div>
          <div className="relative flex-shrink-0">
            <Image
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              height={100}
              width={100}
              quality={80}
              className="h-[80px] w-[80px] rounded-md object-cover"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm">{order.dishSnapshot.name}</h3>
            <div className="text-xs font-semibold">
              {formatCurrency(order.dishSnapshot.price)} x{' '}
              <Badge className="px-1">{order.quantity}</Badge>
            </div>
          </div>
          <div className="ml-auto flex flex-shrink-0 items-center justify-center">
            <Badge variant={'outline'}>
              {tAll(getVietnameseOrderStatus(order.status))}
            </Badge>
          </div>
        </div>
      ))}
      {paid.quantity !== 0 && (
        <div className="sticky bottom-0 bg-white">
          <div className="flex w-full space-x-4 text-xl font-semibold">
            <span>
              {t('applicationPaid')} · {paid.quantity}{' '}
              {tAll('dishes').toLowerCase()}
            </span>
            <span>{formatCurrency(paid.price)}</span>
          </div>
        </div>
      )}
      <div className="sticky bottom-0 bg-white">
        <div className="flex w-full space-x-4 text-xl font-semibold">
          <span>
            {t('unusedApplication')} · {waitingForPaying.quantity}{' '}
            {tAll('dishes').toLowerCase()}
          </span>
          <span>{formatCurrency(waitingForPaying.price)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrdersCart
