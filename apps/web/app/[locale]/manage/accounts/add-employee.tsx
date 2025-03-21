'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, Upload } from 'lucide-react'

import {
  CreateEmployeeAccountBody,
  CreateEmployeeAccountBodyType,
} from '@/schemaValidations/account.schema'
import { useAddAccountMutation } from '@/queries/useAccount'
import { useUploadMediaMutation } from '@/queries/useMedia'
import { checkMessageFromResponse, handleErrorApi } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar'
import { Button } from '@repo/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from '@repo/ui/hooks/use-toast'
import { envConfig } from '@/config'

const AddEmployee = () => {
  const t = useTranslations('ManageAccounts')
  const tAll = useTranslations('All')
  const tErrorMessage = useTranslations('ErrorMessage')

  const [file, setFile] = useState<File | null>(null)
  const [open, setOpen] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const addAccountMutation = useAddAccountMutation()
  const uploadMediaMutation = useUploadMediaMutation()

  const form = useForm<CreateEmployeeAccountBodyType>({
    resolver: zodResolver(CreateEmployeeAccountBody),
    defaultValues: {
      name: '',
      email: '',
      avatar: undefined,
      password: '',
      confirmPassword: '',
    },
  })

  const name = form.watch('name')
  const avatar = form.watch('avatar')

  const previewAvatar = useMemo(
    () => (file ? URL.createObjectURL(file) : avatar || undefined),
    [file, avatar],
  )

  const onSubmit = async (values: CreateEmployeeAccountBodyType) => {
    if (addAccountMutation.isPending) return

    try {
      let body = values
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'employees')
        const uploadImageResult =
          await uploadMediaMutation.mutateAsync(formData)
        const imageUrl = uploadImageResult.payload.data
        body = {
          ...values,
          avatar: imageUrl,
        }
      }
      const result = await addAccountMutation.mutateAsync(body)

      if (file && previewAvatar && previewAvatar.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatar)
      }

      toast({
        description: result.payload.message,
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
    if (file && previewAvatar && previewAvatar.startsWith('blob:')) {
      URL.revokeObjectURL(previewAvatar)
    }
    setFile(null)
    setOpen(false)
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {t('createAccount')}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('createAccount')}</DialogTitle>
          <DialogDescription>{t('requiredDescription')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-employee-form"
            onSubmit={form.handleSubmit(onSubmit, console.log)}
            onReset={reset}
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
                name="password"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="password">{tAll('password')}</Label>
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
                              : tErrorMessage(errors.password?.message as any))}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="confirmPassword">
                        {tAll('confirmPassword')}
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
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="add-employee-form">
            {tAll('add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddEmployee
