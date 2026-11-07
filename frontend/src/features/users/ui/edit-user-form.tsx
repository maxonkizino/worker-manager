// features/users/ui/user/edit-user-form.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Loader2 } from "lucide-react";
import { ApiSchemas } from "@/shared/api/schema/index.ts";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/kit/alert";
import { Label } from "@/shared/ui/kit/label";
import { AlertCircle } from "lucide-react";
import { useUpdateUser } from "../model/use-update-user"; // Uncommented
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";

interface EditUserFormProps {
  user: ApiSchemas["UserResponse"];
  onCancel: () => void;
  // onSuccess: () => void; // Removed, as we navigate directly
  // Removed isPending, error, updateUser from props
}

export function EditUserForm({ user, onCancel }: EditUserFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ApiSchemas["UpdateUserRequest"]>({
    defaultValues: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      password: "",
    },
  });

  const navigate = useNavigate();

  const { mutate: updateUser, isPending, error } = useUpdateUser(user.id, () => {
    navigate(ROUTES.USER_BOARDS); // Navigate directly to user list
  });

  const onSubmit = (data: ApiSchemas["UpdateUserRequest"]) => {
    updateUser({
      params: {
        path: { id: user.id },
      },
      body: data,
    });
  };

  useEffect(() => {
    reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      password: "",
    });
  }, [user, reset]);

  return (
    <form key={user.id} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>
            {error.message === "USER_EXISTS"
              ? "Пользователь с таким email уже существует"
              : error.message || "Не удалось обновить профиль"}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="username" className="block mb-2">Имя пользователя</Label>
        <Input
          id="username"
          className="mt-1"
          {...register("username", { required: "Имя пользователя обязательно" })}
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
      </div>

      <div>
        <Label htmlFor="email" className="block mb-2">Email</Label>
        <Input
          id="email"
          type="email"
          className="mt-1"
          {...register("email", {
            required: "Email обязателен",
            pattern: { value: /^\S+@\S+$/i, message: "Неверный формат email" },
          })}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password" className="block mb-2">Новый пароль (оставьте пустым, чтобы не менять)</Label>
        <Input
          id="password"
          type="password"
          className="mt-1"
          {...register("password")}
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="firstName" className="block mb-2">Имя</Label>
        <Input
          id="firstName"
          className="mt-1"
          {...register("firstName")}
        />
      </div>

      <div>
        <Label htmlFor="lastName" className="block mb-2">Фамилия</Label>
        <Input
          id="lastName"
          className="mt-1"
          {...register("lastName")}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Сохранить"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}