import { rqClient } from "@/shared/api/instance";

export function useCurrentUser() {
    return rqClient.useQuery("get", "/me/profile");
}