import { publicRqClient } from "@/shared/api/instance";
import { components } from "@/shared/api/schema/generated";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { useNavigate } from "react-router-dom";

type RegisterRequest = components["schemas"]["RegisterRequest"];

export function useRegister() {
  const navigate = useNavigate();

  const session = useSession();
  const registerMutation = publicRqClient.useMutation(
    "post",
    "/auth/signUp",
    {
      onSuccess(data) {
        session.login(data.token);
        navigate(ROUTES.HOME);
      },
    },
  );

  const register = (data: RegisterRequest) => {
    registerMutation.mutate({ body: data });
  };

  const errorMessage = registerMutation.isError
    ? registerMutation.error?.message
    : undefined;

  return {
    register,
    isPending: registerMutation.isPending,
    errorMessage,
  };
}
