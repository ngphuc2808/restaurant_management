'use client'

import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useRouter } from '@/i18n/routing'
import useAppStore from '@/store/app'
import {
  GuestLoginBody,
  GuestLoginBodyType,
} from '@/schemaValidations/guest.schema'
import { useGuestLoginMutation } from '@/queries/useGuest'
import {
  checkMessageFromResponse,
  generateSocketInstace,
  handleErrorApi,
} from '@/lib/utils'
import { Button } from '@repo/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card'
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from '@repo/ui/components/form'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'

const GuestLoginForm = () => {
  const { role, setRole, setSocket } = useAppStore()

  const t = useTranslations('LoginGuest')
  const tErrorMessage = useTranslations('ErrorMessage')

  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const tableNumber = Number(params.number)
  const token = searchParams.get('token')

  const loginMutation = useGuestLoginMutation()

  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: '',
      token: token ?? '',
      tableNumber,
    },
  })

  const onSubmit = async (values: GuestLoginBodyType) => {
    if (loginMutation.isPending) return
    try {
      const result = await loginMutation.mutateAsync(values)
      setRole(result.payload.data.guest.role)
      setSocket(generateSocketInstace(result.payload.data.accessToken))
      router.push('/guest/menu')
    } catch (error) {
      console.log('>>> error: ', error)
      handleErrorApi({
        error,
        setError: form.setError,
      })
    }
  }

  useEffect(() => {
    if (!token || role) {
      router.push('/')
    }
  }, [role, token, router])

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="w-full max-w-[600px] flex-shrink-0 space-y-2"
            noValidate
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <Label htmlFor="name">{t('guestName')}</Label>
                      <Input id="name" type="text" required {...field} />
                      <FormMessage>
                        {errors.name?.message &&
                          (checkMessageFromResponse(errors.name?.type)
                            ? errors.name?.message
                            : tErrorMessage(errors.name?.message as any))}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                {t('login')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default GuestLoginForm
