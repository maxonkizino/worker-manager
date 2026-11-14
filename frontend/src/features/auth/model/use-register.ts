import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/shared/api";
import type { LoginRequest, LoginResponse, RegisterRequest } from "@/shared/api/types";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";

export function useRegister() {
  const navigate = useNavigate();
  const { login } = useSession();

  const mutation = useMutation({
    mutationFn: async (body: RegisterRequest) => {
      await apiRequest("/auth/register", {
        method: "POST",
        body,
        auth: false,
      });
      const loginBody: LoginRequest = {
        username: body.username,
        password: body.password,
      };
      return apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: loginBody,
        auth: false,
      });
    },
    onSuccess: (data) => {
      login(data.accessToken);
      navigate(ROUTES.DASHBOARD);
    },
  });

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.error?.message,
  };
}
