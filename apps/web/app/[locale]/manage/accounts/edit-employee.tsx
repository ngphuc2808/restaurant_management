'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'

import {
  UpdateEmployeeAccountBody,
  UpdateEmployeeAccountBodyType,
} from '@/schemaValidations/account.schema'
import { useGetAccount, useUpdateAccountMutation } from '@/queries/useAccount'
import { useUploadMediaMutation } from '@/queries/useMedia'
import {
  checkMessageFromResponse,
  getVietnameseRole,
  handleErrorApi,
} from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar'
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
import { toast } from '@repo/ui/hooks/use-toast'
import { Role, RoleValues } from '@/constants/type'
import { envConfig } from '@/config'

const EditEmployee = ({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) => {
  const t = useTranslations('ManageAccounts')
  const tAll = useTranslations('All')
  const tErrorMessage = useTranslations('ErrorMessage')

  const [file, setFile] = useState<File | null>(null)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const dataAccount = useGetAccount({
    id: id as number,
    enabled: Boolean(id),
  })

  const updateAccountMutation = useUpdateAccountMutation()
  const uploadMediaMutation = useUploadMediaMutation()

  const form = useForm<UpdateEmployeeAccountBodyType>({
    resolver: zodResolver(UpdateEmployeeAccountBody),
    defaultValues: {
      name: '',
      email: '',
      avatar: undefined,
      changePassword: false,
      role: Role.Employee,
    },
  })
  const avatar = form.watch('avatar')
  const name = form.watch('name')
  const changePassword = form.watch('changePassword')

  const previewAvatar = useMemo(
    () => (file ? URL.createObjectURL(file) : avatar || undefined),
    [file, avatar],
  )

  const onSubmit = async (values: UpdateEmployeeAccountBodyType) => {
    if (updateAccountMutation.isPending) return
    try {
      let body: UpdateEmployeeAccountBodyType & { id: number } = {
        id: id as number,
        ...values,
      }
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'employees')
        const uploadImageResult =
          await uploadMediaMutation.mutateAsync(formData)
        const imageUrl = uploadImageResult.payload.data
        body = {
          ...body,
          avatar: imageUrl,
        }
      }
      const result = await updateAccountMutation.mutateAsync(body)
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
    if (file && previewAvatar && previewAvatar.startsWith('blob:')) {
      URL.revokeObjectURL(previewAvatar)
    }
    setId(undefined)
    setFile(null)
    form.reset()
  }

  useEffect(() => {
    if (dataAccount.data) {
      const { name, avatar, email, role } = dataAccount.data.payload.data
      form.reset({
        name,
        avatar: avatar ?? undefined,
        email,
        changePassword: form.getValues('changePassword'),
        password: form.getValues('password'),
        confirmPassword: form.getValues('confirmPassword'),
        role,
      })
    }
  }, [dataAccount.data, form])

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
          <DialogTitle>{t('updateAccount')}</DialogTitle>
          <DialogDescription>{t('requiredDescription')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-employee-form"
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start justify-start gap-2">
                      <Avatar className="aspect-square h-[100px] w-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatar} />
                        <AvatarFallback className="rounded-none text-center">
                          {name || tAll('avatar')}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFile(file)
                            field.onChange(
                              `${envConfig.NEXT_PUBLIC_URL}/` + file.name,
                            )
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">{tAll('name')}</Label>
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
                name="email"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="email">{tAll('email')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="email" className="w-full" {...field} />
                        <FormMessage>
                          {errors.email?.message &&
                            (checkMessageFromResponse(errors.email?.type)
                              ? errors.email?.message
                              : tErrorMessage(errors.email?.message as any))}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="role">{tAll('role')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectRole')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RoleValues.map((role) => {
                              if (role === Role.Guest) return null
                              return (
                                <SelectItem key={role} value={role}>
                                  {tAll(getVietnameseRole(role))}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage>
                          {errors.role?.message &&
                            (checkMessageFromResponse(errors.role?.type)
                              ? errors.role?.message
                              : tErrorMessage(errors.role?.message as any))}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="changePassword"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="email">{t('changePassword')}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Switch
                          checked={field.value}
                          onCheckedChange={(value) => {
                            field.onChange(value)
                            if (!value) {
                              form.setValue('password', undefined)
                              form.setValue('confirmPassword', undefined)
                            } else {
                              form.setValue('password', '')
                              form.setValue('confirmPassword', '')
                            }
                          }}
                        />
                        <FormMessage>
                          {errors.changePassword?.message &&
                            (checkMessageFromResponse(
                              errors.changePassword?.type,
                            )
                              ? errors.changePassword?.message
                              : tErrorMessage(
                                  errors.changePassword?.message as any,
                                ))}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              {changePassword && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="password">{t('newPassword')}</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input
                            id="password"
                            className="w-full"
                            type="password"
                            {...field}
                          />
                          <FormMessage>
                            {errors.password?.message &&
                              (checkMessageFromResponse(errors.password?.type)
                                ? errors.password?.message
                                : tErrorMessage(
                                    errors.password?.message as any,
                                  ))}
                          </FormMessage>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}
              {changePassword && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="confirmPassword">
                          {t('confirmNewPassword')}
                        </Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input
                            id="confirmPassword"
                            className="w-full"
                            type="password"
                            {...field}
                          />
                          <FormMessage>
                            {errors.confirmPassword?.message &&
                              (checkMessageFromResponse(
                                errors.confirmPassword?.type,
                              )
                                ? errors.confirmPassword?.message
                                : tErrorMessage(
                                    errors.confirmPassword?.message as any,
                                  ))}
                          </FormMessage>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-employee-form">
            {tAll('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditEmployee
