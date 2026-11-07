import { publicRqClient } from "@/shared/api/instance";
import { components } from "@/shared/api/schema/generated";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { useNavigate } from "react-router-dom";

type LoginRequest = components["schemas"]["LoginRequest"];

export function useLogin() {
  const navigate = useNavigate();

  const session = useSession();
  const loginMutation = publicRqClient.useMutation("post", "/auth/signIn", {
    onSuccess(data) {
      session.login(data.token);
      navigate(ROUTES.HOME);
    },
  });

  const login = (data: LoginRequest) => {
    loginMutation.mutate({ body: data });
  };

  const errorMessage = loginMutation.isError
    ? loginMutation.error?.message
    : undefined;

  return {
    login,
    isPending: loginMutation.isPending,
    errorMessage,
  };
}
