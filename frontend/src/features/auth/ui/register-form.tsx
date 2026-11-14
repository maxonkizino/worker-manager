import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { useRegister } from "../model/use-register";

const schema = z.object({
  username: z.string().min(3, "Минимум 3 символа"),
  email: z.string().email("Некорректный e-mail"),
  fullName: z.string().min(2, "Укажите ФИО"),
  password: z.string().min(8, "Минимум 8 символов"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const { register: signUp, isPending, errorMessage } = useRegister();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", fullName: "", password: "" },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => signUp(values))}
    >
      <div className="space-y-2">
        <Label htmlFor="username">Логин</Label>
        <Input id="username" {...form.register("username")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">ФИО</Label>
        <Input id="fullName" {...form.register("fullName")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" type="password" {...form.register("password")} />
      </div>
      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Регистрация..." : "Зарегистрироваться"}
      </Button>
    </form>
  );
}
