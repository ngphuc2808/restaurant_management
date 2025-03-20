"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ChangePasswordBody,
  ChangePasswordBodyType,
} from "@/schemaValidations/account.schema";
import { useChangePasswordMutation } from "@/queries/useAccount";
import {
  checkMessageFromResponse,
  handleErrorApi,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from "@/lib/utils";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { toast } from "@repo/ui/hooks/use-toast";

const ChangePasswordForm = () => {
  const t = useTranslations("Settings");
  const tAll = useTranslations("All");
  const tErrorMessage = useTranslations("ErrorMessage");

  const changePasswordMutation = useChangePasswordMutation();
  const form = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordBodyType) => {
    if (changePasswordMutation.isPending) return;
    try {
      const result = await changePasswordMutation.mutateAsync(values);
      setAccessTokenToLocalStorage(result.payload.data.accessToken);
      setRefreshTokenToLocalStorage(result.payload.data.refreshToken);
      toast({
        description: result.payload.message,
      });
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  const reset = () => {
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid auto-rows-max items-start gap-4 md:gap-8"
        onSubmit={form.handleSubmit(onSubmit, console.log)}
        onReset={reset}
      >
        <Card className="overflow-hidden" x-chunk="dashboard-07-chunk-4">
          <CardHeader>
            <CardTitle>{t("changePassword")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="oldPassword">
                        {t("enterOldPassword")}
                      </Label>
                      <Input
                        autoComplete="current-password"
                        id="oldPassword"
                        type="password"
                        className="w-full"
                        {...field}
                      />
                      <FormMessage>
                        {errors.oldPassword?.message &&
                          (checkMessageFromResponse(errors.oldPassword?.type)
                            ? errors.oldPassword?.message
                            : tErrorMessage(
                                errors.oldPassword?.message as any,
                              ))}
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
                    <div className="grid gap-3">
                      <Label htmlFor="password">{t("enterNewPassword")}</Label>
                      <Input
                        autoComplete="new-password"
                        id="password"
                        type="password"
                        className="w-full"
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="confirmPassword">
                        {t("rerenderPassword")}
                      </Label>
                      <Input
                        autoComplete="new-password"
                        id="confirmPassword"
                        type="password"
                        className="w-full"
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
                  </FormItem>
                )}
              />
              <div className=" items-center gap-2 md:ml-auto flex">
                <Button variant="outline" size="sm" type="reset">
                  {tAll("cancel")}
                </Button>
                <Button size="sm" type="submit">
                  {tAll("save")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default ChangePasswordForm;
