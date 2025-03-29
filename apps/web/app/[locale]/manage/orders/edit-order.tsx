'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@repo/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import {
  UpdateOrderBody,
  UpdateOrderBodyType,
} from '@/schemaValidations/order.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form'
import {
  checkMessageFromResponse,
  getVietnameseOrderStatus,
  handleErrorApi,
} from '@/lib/utils'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import DishesDialog from '@/app/[locale]/manage/orders/dishes-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar'
import { useEffect, useState } from 'react'
import { DishListResType } from '@/schemaValidations/dish.schema'
import {
  useGetOrderDetailQuery,
  useUpdateOrderMutation,
} from '@/queries/useOrder'
import { toast } from '@repo/ui/hooks/use-toast'

type DistType = DishListResType['data']['dishes'][0]

const EditOrder = ({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) => {
  const t = useTranslations('Orders')
  const tAll = useTranslations('All')
  const tErrorMessage = useTranslations('ErrorMessage')

  const [selectedDish, setSelectedDish] = useState<DistType | null>(null)
  const updateOrderMutation = useUpdateOrderMutation()
  const { data } = useGetOrderDetailQuery({
    id: id as number,
    enabled: Boolean(id),
  })

  const form = useForm<UpdateOrderBodyType>({
    resolver: zodResolver(UpdateOrderBody),
    defaultValues: {
      status: OrderStatus.Pending,
      dishId: 0,
      quantity: 1,
    },
  })

  useEffect(() => {
    if (data) {
      const {
        status,
        dishSnapshot: { dishId },
        quantity,
      } = data.payload.data
      form.reset({
        status,
        dishId: dishId ?? 0,
        quantity,
      })
      setSelectedDish(data.payload.data.dishSnapshot)
    }
  }, [data, form])

  const onSubmit = async (values: UpdateOrderBodyType) => {
    if (updateOrderMutation.isPending) return
    try {
      let body: UpdateOrderBodyType & { orderId: number } = {
        orderId: id as number,
        ...values,
      }
      const result = await updateOrderMutation.mutateAsync(body)
      toast({
        description: result.payload.message,
      })
      reset()
      onSubmitSuccess && onSubmitSuccess()
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      })
    }
  }

  const reset = () => {
    setId(undefined)
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent className="max-h-screen overflow-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('updateOrder')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-order-form"
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="dishId"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <FormLabel>{t('dishes')}</FormLabel>
                    <div className="col-span-2 flex items-center space-x-4">
                      <Avatar className="aspect-square h-[50px] w-[50px] rounded-md object-cover">
                        <AvatarImage src={selectedDish?.image} />
                        <AvatarFallback className="rounded-none text-center">
                          {selectedDish?.name}
                        </AvatarFallback>
                      </Avatar>
                      <div>{selectedDish?.name}</div>
                    </div>

                    <DishesDialog
                      onChoose={(dish) => {
                        field.onChange(dish.id)
                        setSelectedDish(dish)
                      }}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="quantity">{t('quantity')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="quantity"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-16 text-center"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            let value = e.target.value
                            const numberValue = Number(value)
                            if (isNaN(numberValue)) {
                              return
                            }
                            field.onChange(numberValue)
                          }}
                        />
                        <FormMessage>
                          {errors.quantity?.message &&
                            (checkMessageFromResponse(errors.quantity?.type)
                              ? errors.quantity?.message
                              : tErrorMessage(errors.quantity?.message as any))}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <FormLabel>{tAll('status')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="col-span-3">
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={tAll('status')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OrderStatusValues.map((status) => (
                            <SelectItem key={status} value={status}>
                              {tAll(getVietnameseOrderStatus(status))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage>
                        {errors.status?.message &&
                          (checkMessageFromResponse(errors.status?.type)
                            ? errors.status?.message
                            : tErrorMessage(errors.status?.message as any))}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-order-form">
            {tAll('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditOrder
