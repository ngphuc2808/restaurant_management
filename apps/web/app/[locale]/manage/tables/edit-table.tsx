'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Link } from '@/i18n/routing'
import {
  UpdateTableBody,
  UpdateTableBodyType,
} from '@/schemaValidations/table.schema'
import { useGetTableQuery, useUpdateTableMutation } from '@/queries/useTable'
import {
  checkMessageFromResponse,
  getTableLink,
  getVietnameseTableStatus,
  handleErrorApi,
} from '@/lib/utils'
import { Button } from '@repo/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@repo/ui/components/form'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import { Switch } from '@repo/ui/components/switch'
import { TableStatus, TableStatusValues } from '@/constants/type'
import { toast } from '@repo/ui/hooks/use-toast'
import QRCodeTable from '@/app/[locale]/manage/tables/qrcode-table'

const EditTable = ({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) => {
  const t = useTranslations('Tables')
  const tAll = useTranslations('All')
  const tErrorMessage = useTranslations('ErrorMessage')

  const updateTableMutation = useUpdateTableMutation()

  const locale = useLocale()

  const form = useForm<UpdateTableBodyType>({
    resolver: zodResolver(UpdateTableBody),
    defaultValues: {
      capacity: 2,
      status: TableStatus.Hidden,
      changeToken: false,
    },
  })
  const { data } = useGetTableQuery({ enabled: Boolean(id), id: id as number })

  const onSubmit = async (values: UpdateTableBodyType) => {
    if (updateTableMutation.isPending) return
    try {
      let body: UpdateTableBodyType & { id: number } = {
        id: id as number,
        ...values,
      }
      const result = await updateTableMutation.mutateAsync(body)
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

  useEffect(() => {
    if (data) {
      const { capacity, status } = data.payload.data
      form.reset({
        capacity,
        status,
        changeToken: form.getValues('changeToken'),
      })
    }
  }, [data, form])

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent
        className="max-h-screen overflow-auto sm:max-w-[600px]"
        onCloseAutoFocus={() => {
          form.reset()
          setId(undefined)
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('updateTable')}</DialogTitle>
          <DialogDescription>{t('requiredDescription')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            onSubmit={form.handleSubmit(onSubmit, console.log)}
            id="edit-table-form"
          >
            <div className="grid gap-4 py-4">
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label htmlFor="name">{t('table.tableNumber')}</Label>
                  <div className="col-span-3 w-full space-y-2">
                    <Input
                      id="number"
                      type="number"
                      className="w-full"
                      value={data?.payload.data.number ?? 0}
                      readOnly
                    />
                  </div>
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name="capacity"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="price">{t('table.capacity')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="capacity"
                          className="w-full"
                          {...field}
                          type="number"
                        />
                        <FormMessage>
                          {errors.capacity?.message &&
                            (checkMessageFromResponse(errors.capacity?.type)
                              ? errors.capacity?.message
                              : tErrorMessage(errors.capacity?.message as any))}
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
                      <Label htmlFor="description">{t('table.status')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectStatus')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TableStatusValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {tAll(getVietnameseTableStatus(status))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
              <FormField
                control={form.control}
                name="changeToken"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="price">{t('changeQrCode')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="changeToken"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      </div>
                      <FormMessage>
                        {errors.changeToken?.message &&
                          (checkMessageFromResponse(errors.changeToken?.type)
                            ? errors.changeToken?.message
                            : tErrorMessage(
                                errors.changeToken?.message as any,
                              ))}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label>{t('table.qrCode')}</Label>
                  <div className="col-span-3 w-full space-y-2">
                    {data && (
                      <QRCodeTable
                        token={data.payload.data.token}
                        tableNumber={data.payload.data.number}
                      />
                    )}
                  </div>
                </div>
              </FormItem>
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label>{t('urlOrdering')}</Label>
                  <div className="col-span-3 w-full space-y-2">
                    {data && (
                      <Link
                        href={getTableLink({
                          locale,
                          token: data.payload.data.token,
                          tableNumber: data.payload.data.number,
                        })}
                        target="_blank"
                        className="break-all"
                      >
                        {getTableLink({
                          locale,
                          token: data.payload.data.token,
                          tableNumber: data.payload.data.number,
                        })}
                      </Link>
                    )}
                  </div>
                </div>
              </FormItem>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-table-form">
            {tAll('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditTable
