// features/users/lib/validations.ts
import { z } from "zod";

export const editUserSchema = z.object({
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа"),
  email: z.string().email("Введите корректный email"),
  firstName: z.string().min(1, "Имя обязательно").max(50, "Имя слишком длинное"),
  lastName: z.string().min(1, "Фамилия обязательна").max(50, "Фамилия слишком длинная"),
  password: z.string().optional(),
});

export const createUserSchema = z.object({
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  roles: z.array(z.string()).min(1, "Выберите хотя бы одну роль"),
});

export type EditUserFormData = z.infer<typeof editUserSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;