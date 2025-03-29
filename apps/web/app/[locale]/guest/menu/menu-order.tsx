'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { useRouter } from '@/i18n/routing'
import { GuestCreateOrdersBodyType } from '@/schemaValidations/guest.schema'
import { useDishListQuery } from '@/queries/useDish'
import { useGuestOrderMutation } from '@/queries/useGuest'
import { formatCurrency, handleErrorApi } from '@/lib/utils'
import { cn } from '@repo/ui/lib/utils'
import { Button } from '@repo/ui/components/button'
import { DishStatus } from '@/constants/type'
import Quantity from '@/app/[locale]/guest/menu/quantity'
import AutoPagination from '@/components/molecules/auto-pagination'

const MenuOrder = () => {
  const router = useRouter()

  const t = useTranslations('GuestMenu')
  const tAll = useTranslations('All')

  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([])

  const [page, setPage] = useState<number>(0)
  const [limit, setLimit] = useState<number>(12)
  const dishListQuery = useDishListQuery(page + 1, limit)

  const dishes = dishListQuery.data?.payload.data.dishes ?? []
  const meta = dishListQuery.data?.payload.data.meta

  const { mutateAsync } = useGuestOrderMutation()

  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dishId === dish.id)
      if (!order) return result
      return result + order.quantity * dish.price
    }, 0)
  }, [dishes, orders])

  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId)
      }
      const index = prevOrders.findIndex((order) => order.dishId === dishId)
      if (index === -1) {
        return [...prevOrders, { dishId, quantity }]
      }
      const newOrders = [...prevOrders]
      newOrders[index] = { dishId: newOrders[index]?.dishId!, quantity }
      return newOrders
    })
  }

  const handleOrder = async () => {
    try {
      await mutateAsync(orders)
      router.push(`/guest/orders`)
    } catch (error) {
      handleErrorApi({
        error,
      })
    }
  }

  if (dishes.length === 0)
    return (
      <div>
        <h1 className="text-2xl font-semibold lg:text-3xl">{tAll('noData')}</h1>
      </div>
    )

  return (
    <div className="mx-auto max-w-[800px] space-y-4">
      <h1 className="text-center text-xl font-bold">🍕 {t('title')}</h1>
      {dishes
        .filter((dish) => dish.status !== DishStatus.Hidden)
        .map((dish) => (
          <div
            key={dish.id}
            className={cn('flex gap-4', {
              'pointer-events-none': dish.status === DishStatus.Unavailable,
            })}
          >
            <div className="relative flex-shrink-0">
              {dish.status === DishStatus.Unavailable && (
                <span className="absolute inset-0 flex items-center justify-center rounded-md bg-slate-600/50 text-center text-sm text-white">
                  {t('outOfFood')}
                </span>
              )}
              <Image
                src={dish.image}
                alt={dish.name}
                height={100}
                width={100}
                quality={80}
                className="h-[80px] w-[80px] rounded-md object-cover"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm">{dish.name}</h3>
              <p className="text-xs">{dish.description}</p>
              <p className="text-xs font-semibold">
                {formatCurrency(dish.price)}
              </p>
            </div>
            <div className="ml-auto flex flex-shrink-0 items-center justify-center">
              <Quantity
                onChange={(value) => handleQuantityChange(dish.id, value)}
                value={
                  orders.find((order) => order.dishId === dish.id)?.quantity ??
                  0
                }
              />
            </div>
          </div>
        ))}
      <div>
        <AutoPagination
          pageSize={meta?.totalPages ?? 1}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
        />
      </div>
      <div className="sticky bottom-0">
        <Button
          className="w-full justify-between"
          onClick={handleOrder}
          disabled={orders.length === 0}
        >
          <span>
            {t('order')} · {orders.length} {tAll('dishes').toLowerCase()}
          </span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </div>
  )
}

export default MenuOrder
