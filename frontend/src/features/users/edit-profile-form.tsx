import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/kit/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { ApiSchemas } from "@/shared/api/schema";
import { useUpdateProfile } from "./model/use-update-profile";

interface EditProfileFormProps {
    user: ApiSchemas["ProfileResponse"];
    onCancel: () => void;
}

export function EditProfileForm({ user, onCancel }: EditProfileFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ApiSchemas["UpdateUserRequest"]>({
        defaultValues: {
            username: user.username,
            email: user.email,
            password: "",
            firstName: user.firstName,
            lastName: user.lastName,
        },
    });

    const { mutate: updateUser, isPending, error } = useUpdateProfile(
        onCancel, 
        (err: Error) => console.error(err)
    );

    const onSubmit = (data: ApiSchemas["UpdateUserRequest"]) => {
        const updateData: ApiSchemas["UpdateUserRequest"] = {
            username: data.username,
            email: data.email,
        };

        if (data.firstName && data.firstName.trim() !== "") {
            updateData.firstName = data.firstName;
        }

        if (data.lastName && data.lastName.trim() !== "") {
            updateData.lastName = data.lastName;
        }

        if (data.password && data.password.trim() !== "") {
            updateData.password = data.password;
        }

        updateUser({ body: updateData });
    };

    useEffect(() => {
        reset({
            username: user.username,
            email: user.email,
            password: "",
            firstName: user.firstName,
            lastName: user.lastName,
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
                <Label htmlFor="password" className="block mb-2">Новый пароль</Label>
                <Input
                    id="password"
                    type="password"
                    className="mt-1"
                    {...register("password", { 
                        minLength: { value: 6, message: "Пароль должен содержать минимум 6 символов" }
                    })}
                    placeholder="Оставьте пустым, если не хотите менять пароль"
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
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                    Отмена
                </Button>
            </div>
        </form>
    );
}