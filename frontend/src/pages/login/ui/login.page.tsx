import { Link } from "react-router-dom";
import { AuthLayout } from "@/widgets/auth-layout";
import { LoginForm } from "@/features/auth";
import { ROUTES } from "@/shared/model/routes";

export function Component() {
  return (
    <AuthLayout
      title="Вход в TaskFlow Planner"
      description="Планирование задач и анализ нагрузки команды"
      form={<LoginForm />}
      footerText={
        <>
          Нет аккаунта? <Link to={ROUTES.REGISTER}>Зарегистрироваться</Link>
        </>
      }
    />
  );
}
