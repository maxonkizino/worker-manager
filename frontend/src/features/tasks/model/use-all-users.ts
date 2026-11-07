import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/shared/api/instance";

export function useAllUsers() {
  return useQuery({
    queryKey: ["get", "/users/all"],
    queryFn: async () => {
      const response = await fetchClient.GET("/users/all");
      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch users");
      }
      return response.data ?? [];
    },
  });
}

