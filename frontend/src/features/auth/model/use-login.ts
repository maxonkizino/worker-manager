import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/shared/api";
import type { LoginRequest, LoginResponse } from "@/shared/api/types";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";

export function useLogin() {
  const navigate = useNavigate();
  const { login } = useSession();

  const mutation = useMutation({
    mutationFn: (body: LoginRequest) =>
      apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body,
        auth: false,
      }),
    onSuccess: (data) => {
      login(data.accessToken);
      navigate(ROUTES.DASHBOARD);
    },
  });

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.error?.message,
  };
}
