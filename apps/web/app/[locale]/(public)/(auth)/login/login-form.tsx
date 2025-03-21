'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'

import { Link, useRouter } from '@/i18n/routing'
import useAppStore from '@/store/app'
import { LoginBody, LoginBodyType } from '@/schemaValidations/auth.schema'
import { useLoginMutation } from '@/queries/useAuth'
import {
  checkMessageFromResponse,
  generateSocketInstace,
  handleErrorApi,
} from '@/lib/utils'
import { Button } from '@repo/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
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
import SearchParamsLoader, {
  useSearchParamsLoader,
} from '@/components/atoms/search-params-loader'
import { envConfig } from '@/config'

const getOauthGoogleUrl = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const options = {
    redirect_uri: envConfig.NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI,
    client_id: envConfig.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  }
  const qs = new URLSearchParams(options)
  return `${rootUrl}?${qs.toString()}`
}

const googleOauthUrl = getOauthGoogleUrl()

const LoginForm = () => {
  const { setRole, setSocket } = useAppStore()

  const t = useTranslations('Login')
  const tAll = useTranslations('All')
  const tErrorMessage = useTranslations('ErrorMessage')

  const router = useRouter()
  const { searchParams, setSearchParams } = useSearchParamsLoader()
  const clearTokens = searchParams?.get('clearTokens')
  const loginMutation = useLoginMutation()

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginBodyType) => {
    if (loginMutation.isPending) return

    try {
      const result = await loginMutation.mutateAsync(values)
      setRole(result.payload.data.account.role)
      setSocket(generateSocketInstace(result.payload.data.accessToken))
      router.push('/manage/dashboard')
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      })
    }
  }

  useEffect(() => {
    if (clearTokens) {
      setRole(undefined)
    }
  }, [clearTokens, setRole])

  return (
    <>
      <SearchParamsLoader onParamsReceived={setSearchParams} />
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('cardDescription')}</CardDescription>
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
                  name="email"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid gap-2">
                        <Label htmlFor="email">{tAll('email')}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          {...field}
                        />
                        <FormMessage>
                          {errors.email?.message &&
                            (checkMessageFromResponse(errors.email?.type)
                              ? errors.email?.message
                              : tErrorMessage(errors.email?.message as any))}
                        </FormMessage>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Label htmlFor="password">{tAll('password')}</Label>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          required
                          {...field}
                        />
                        <FormMessage>
                          {errors.password?.message &&
                            (checkMessageFromResponse(errors.password?.type)
                              ? errors.password?.message
                              : tErrorMessage(errors.password?.message as any))}
                        </FormMessage>
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {loginMutation.isPending && (
                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {t('buttonLogin')}
                </Button>
                <Link href={googleOauthUrl}>
                  <Button variant="outline" className="w-full" type="button">
                    {t('loginWithGoogle')}
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}

export default LoginForm
