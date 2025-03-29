'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import {
  GetOrdersResType,
  PayGuestOrdersResType,
} from '@/schemaValidations/order.schema'
import { usePayForGuestMutation } from '@/queries/useOrder'
import {
  formatCurrency,
  formatDateTimeToLocaleString,
  formatDateTimeToTimeString,
  getVietnameseOrderStatus,
  handleErrorApi,
} from '@/lib/utils'
import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { OrderStatus, OrderStatusIcon } from '@/constants/type'

type Guest = GetOrdersResType['data']['orders'][0]['guest']
type Orders = GetOrdersResType['data']['orders']

const OrderGuestDetail = ({
  guest,
  orders,
  onPaySuccess,
}: {
  guest: Guest
  orders: Orders
  onPaySuccess?: (data: PayGuestOrdersResType) => void
}) => {
  const t = useTranslations('Orders')
  const tAll = useTranslations('All')

  const ordersFilterToPurchase = guest
    ? orders.filter(
        (order) =>
          order.status !== OrderStatus.Paid &&
          order.status !== OrderStatus.Rejected,
      )
    : []
  const purchasedOrderFilter = guest
    ? orders.filter((order) => order.status === OrderStatus.Paid)
    : []
  const payForGuestMutation = usePayForGuestMutation()

  const pay = async () => {
    if (payForGuestMutation.isPending || !guest) return
    try {
      const result = await payForGuestMutation.mutateAsync({
        guestId: guest.id,
      })
      onPaySuccess && onPaySuccess(result.payload)
    } catch (error) {
      handleErrorApi({
        error,
      })
    }
  }
  return (
    <div className="space-y-2 text-sm">
      {guest && (
        <>
          <div className="space-x-1">
            <span className="font-semibold">{tAll('name')}:</span>
            <span>{guest.name}</span>
            <span className="font-semibold">(#{guest.id})</span>
            <span>|</span>
            <span className="font-semibold">{t('table.tableNumber')}:</span>
            <span>{guest.tableNumber}</span>
          </div>
          <div className="space-x-1">
            <span className="font-semibold">{t('registrationDate')}:</span>
            <span>{formatDateTimeToLocaleString(guest.createdAt)}</span>
          </div>
        </>
      )}

      <div className="space-y-1">
        <div className="font-semibold">{t('title')}:</div>
        {orders.map((order, index) => {
          return (
            <div key={order.id} className="flex items-center gap-2 text-xs">
              <span className="w-[10px]">{index + 1}</span>
              <span title={getVietnameseOrderStatus(order.status)}>
                {order.status === OrderStatus.Pending && (
                  <OrderStatusIcon.Pending className="h-4 w-4 animate-spin" />
                )}
                {order.status === OrderStatus.Processing && (
                  <OrderStatusIcon.Processing className="h-4 w-4 animate-bounce" />
                )}
                {order.status === OrderStatus.Rejected && (
                  <OrderStatusIcon.Rejected className="h-4 w-4 text-red-400" />
                )}
                {order.status === OrderStatus.Delivered && (
                  <OrderStatusIcon.Delivered className="h-4 w-4" />
                )}
                {order.status === OrderStatus.Paid && (
                  <OrderStatusIcon.Paid className="h-4 w-4 text-yellow-400" />
                )}
              </span>
              <Image
                src={order.dishSnapshot.image}
                alt={order.dishSnapshot.name}
                title={order.dishSnapshot.name}
                width={30}
                height={30}
                className="h-[30px] w-[30px] rounded object-cover"
              />
              <span
                className="w-[70px] truncate sm:w-[100px]"
                title={order.dishSnapshot.name}
              >
                {order.dishSnapshot.name}
              </span>
              <span
                className="font-semibold"
                title={`${t('total')}: ${order.quantity}`}
              >
                x{order.quantity}
              </span>
              <span className="italic">
                {formatCurrency(order.quantity * order.dishSnapshot.price)}
              </span>
              <span
                className="hidden sm:inline"
                title={`${t('create')}: ${formatDateTimeToLocaleString(
                  order.createdAt,
                )} | ${t('update')}: ${formatDateTimeToLocaleString(order.updatedAt)}
          `}
              >
                {formatDateTimeToLocaleString(order.createdAt)}
              </span>
              <span
                className="sm:hidden"
                title={`${t('create')}: ${formatDateTimeToLocaleString(
                  order.createdAt,
                )} | ${t('update')}: ${formatDateTimeToLocaleString(order.updatedAt)}
          `}
              >
                {formatDateTimeToTimeString(order.createdAt)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="space-x-1">
        <span className="font-semibold">{t('paid')}:</span>
        <Badge>
          <span>
            {formatCurrency(
              ordersFilterToPurchase.reduce((acc, order) => {
                return acc + order.quantity * order.dishSnapshot.price
              }, 0),
            )}
          </span>
        </Badge>
      </div>
      <div className="space-x-1">
        <span className="font-semibold">{t('unpaid')}:</span>
        <Badge variant={'outline'}>
          <span>
            {formatCurrency(
              purchasedOrderFilter.reduce((acc, order) => {
                return acc + order.quantity * order.dishSnapshot.price
              }, 0),
            )}
          </span>
        </Badge>
      </div>
      <div>
        <Button
          className="w-full"
          size={'sm'}
          variant={'secondary'}
          disabled={ordersFilterToPurchase.length === 0}
          onClick={pay}
        >
          {t('payAll', { total: ordersFilterToPurchase.length })}
        </Button>
      </div>
    </div>
  )
}

export default OrderGuestDetail
