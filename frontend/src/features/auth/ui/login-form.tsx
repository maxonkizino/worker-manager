import { Button } from "@/shared/ui/kit/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/shared/ui/kit/form";
import { Input } from "@/shared/ui/kit/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../model/use-login";

const loginSchema = z.object({
  username: z
    .string({
      required_error: "Имя пользователя обязательно",
    })
    .min(3, "Имя пользователя должно быть не менее 3 символов"),
  password: z
    .string({
      required_error: "Пароль обязателен",
    })
    .min(6, "Пароль должен быть не менее 6 символов"),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { errorMessage, isPending, login } = useLogin();

  const onSubmit = form.handleSubmit(login);

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя пользователя</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input placeholder="******" type="password" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {errorMessage && (
          <p className="text-destructive text-sm">{errorMessage}</p>
        )}

        <Button disabled={isPending} type="submit">
          Войти
        </Button>
      </form>
    </Form>
  );
}
