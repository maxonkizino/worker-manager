import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { useLogin } from "../model/use-login";

const schema = z.object({
  username: z.string().min(1, "Укажите логин"),
  password: z.string().min(1, "Укажите пароль"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { login, isPending, errorMessage } = useLogin();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => login(values))}
    >
      <div className="space-y-2">
        <Label htmlFor="username">Логин</Label>
        <Input id="username" autoComplete="username" {...form.register("username")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
      </div>
      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Вход..." : "Войти"}
      </Button>
    </form>
  );
}
