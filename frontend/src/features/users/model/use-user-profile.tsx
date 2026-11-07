import { rqClient } from "@/shared/api/instance";

export function useUserProfile() {
    return rqClient.useQuery("get", "/me/profile");
}