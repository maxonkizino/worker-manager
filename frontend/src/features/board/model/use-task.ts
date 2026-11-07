import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/shared/api/instance";
import { components } from "@/shared/api/schema/generated";

interface UseTaskOptions {
  taskId: string;
}

export function useTask({ taskId }: UseTaskOptions) {
  return useQuery<components["schemas"]["TaskResponse"]>({ 
    queryKey: ["task", taskId],
    queryFn: async () => {
      const { data, error } = await fetchClient.GET("/v1/tasks/{id}", { params: { path: { id: taskId } } });
      if (error) {
        throw new Error("Failed to fetch task");
      }
      return data;
    },
    enabled: !!taskId,
  });
}
