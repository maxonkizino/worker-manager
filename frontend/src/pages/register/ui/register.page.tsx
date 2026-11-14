import { Link } from "react-router-dom";
import { AuthLayout } from "@/widgets/auth-layout";
import { RegisterForm } from "@/features/auth";
import { ROUTES } from "@/shared/model/routes";

export function Component() {
  return (
    <AuthLayout
      title="Регистрация"
      description="Создайте учётную запись сотрудника"
      form={<RegisterForm />}
      footerText={
        <>
          Уже есть аккаунт? <Link to={ROUTES.LOGIN}>Войти</Link>
        </>
      }
    />
  );
}
