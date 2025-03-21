'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle } from 'lucide-react'

import {
  GuestLoginBody,
  GuestLoginBodyType,
} from '@/schemaValidations/guest.schema'
import { GetListGuestsResType } from '@/schemaValidations/account.schema'
import { CreateOrdersBodyType } from '@/schemaValidations/order.schema'
import { useDishListQuery } from '@/queries/useDish'
import { useCreateOrderMutation } from '@/queries/useOrder'
import { useCreateGuestMutation } from '@/queries/useAccount'
import {
  checkMessageFromResponse,
  formatCurrency,
  handleErrorApi,
} from '@/lib/utils'
import { cn } from '@repo/ui/lib/utils'
import { Button } from '@repo/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from '@repo/ui/components/form'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Switch } from '@repo/ui/components/switch'
import { toast } from '@repo/ui/hooks/use-toast'
import { DishStatus } from '@/constants/type'
import GuestsDialog from '@/app/[locale]/manage/orders/guests-dialog'
import Quantity from '@/app/[locale]/guest/menu/quantity'
import TablesDialog from '@/app/[locale]/manage/orders/tables-dialog'

type GuestType = GetListGuestsResType['data'][0]

const AddOrder = () => {
  const t = useTranslations('Orders')
  const tErrorMessage = useTranslations('ErrorMessage')

  const [open, setOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<GuestType | null>(null)
  const [isNewGuest, setIsNewGuest] = useState(true)
  const [orders, setOrders] = useState<CreateOrdersBodyType['orders']>([])
  const { data } = useDishListQuery()
  const dishes = useMemo(() => data?.payload.data ?? [], [data])

  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dishId === dish.id)
      if (!order) return result
      return result + order.quantity * dish.price
    }, 0)
  }, [dishes, orders])

  const createOrderMutation = useCreateOrderMutation()
  const createGuestMutation = useCreateGuestMutation()

  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: '',
      tableNumber: 0,
    },
  })

  const tableNumber = form.watch('tableNumber')

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

  const onSubmit = async (value: GuestLoginBodyType) => {
    try {
      let guestId = selectedGuest?.id
      if (isNewGuest) {
        const guestRes = await createGuestMutation.mutateAsync({
          name: value.name,
          tableNumber,
        })
        guestId = guestRes.payload.data.id
      }
      if (!guestId) {
        toast({
          description: t('pleaseSelectAGuest'),
        })
        return
      }
      await createOrderMutation.mutateAsync({
        guestId,
        orders,
      })
      reset()
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      })
    }
  }

  const reset = () => {
    form.reset()
    setSelectedGuest(null)
    setIsNewGuest(true)
    setOrders([])
    setOpen(false)
  }

  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
        setOpen(value)
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {t('createOrder')}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('createOrder')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 items-center justify-items-start gap-4">
          <Label htmlFor="isNewGuest">{t('newGuest')}</Label>
          <div className="col-span-3 flex items-center">
            <Switch
              id="isNewGuest"
              checked={isNewGuest}
              onCheckedChange={setIsNewGuest}
            />
          </div>
        </div>
        {isNewGuest && (
          <Form {...form}>
            <form
              noValidate
              onSubmit={form.handleSubmit(onSubmit, console.log)}
              className="grid auto-rows-max items-start gap-4 md:gap-8"
              id="add-order-form"
            >
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="name">{t('guestName')}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input id="name" className="w-full" {...field} />
                          <FormMessage>
                            {errors.name?.message &&
                              (checkMessageFromResponse(errors.name?.type)
                                ? errors.name?.message
                                : tErrorMessage(errors.name?.message as any))}
                          </FormMessage>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tableNumber"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="tableNumber">{t('selectTable')}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <div className="flex items-center gap-4">
                            <div>{field.value}</div>
                            <TablesDialog
                              onChoose={(table) => {
                                field.onChange(table.number)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        )}
        {!isNewGuest && (
          <GuestsDialog
            onChoose={(guest) => {
              setSelectedGuest(guest)
            }}
          />
        )}
        {!isNewGuest && selectedGuest && (
          <div className="grid grid-cols-4 items-center justify-items-start gap-4">
            <Label htmlFor="selectedGuest">{t('guestSelected')}</Label>
            <div className="col-span-3 flex w-full items-center gap-4">
              <div>
                {selectedGuest.name} (#{selectedGuest.id})
              </div>
              <div>
                {t('table.tableNumber')}: {selectedGuest.tableNumber}
              </div>
            </div>
          </div>
        )}
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
                  <span className="absolute inset-0 flex items-center justify-center rounded-md bg-slate-600/50 text-sm text-white">
                    {t('outOfStock')}
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
                    orders.find((order) => order.dishId === dish.id)
                      ?.quantity ?? 0
                  }
                />
              </div>
            </div>
          ))}
        <DialogFooter>
          <Button
            className="w-full justify-between"
            type="submit"
            form="add-order-form"
            disabled={orders.length === 0}
          >
            <span>
              {t('orderDish')} · {orders.length} {t('dish').toLowerCase()}
            </span>
            <span>{formatCurrency(totalPrice)}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddOrder
