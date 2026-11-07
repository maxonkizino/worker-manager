import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { components } from "@/shared/api/schema/generated";
import { useSession } from "@/shared/model/session";
import { CONFIG } from "@/shared/model/config";

type CreateTaskRequest = components["schemas"]["CreateTaskRequest"];

interface CreateTaskWithFiles {
  task: CreateTaskRequest;
  files?: File[];
}

export function useCreateTask(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async ({ task, files }: CreateTaskWithFiles) => {
      const token = await useSession.getState().refreshToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const formData = new FormData();
      
      // Добавляем task как JSON blob
      const taskBlob = new Blob([JSON.stringify(task)], { type: "application/json" });
      formData.append("task", taskBlob);

      // Добавляем файлы, если они есть
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await fetch(`${CONFIG.API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to create task" }));
        throw new Error(error.message || "Failed to create task");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("✅ Task created:", data);
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks"] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      console.error("❌ Task creation failed:", error);
    },
  });

  const createTask = (task: CreateTaskRequest, files?: File[]) => {
    console.log("📤 Sending task data:", task, "Files:", files?.length || 0);
    createTaskMutation.mutate({ task, files });
  };

  return {
    createTask,
    isPending: createTaskMutation.isPending,
    isSuccess: createTaskMutation.isSuccess,
    errorMessage: createTaskMutation.error?.message,
    data: createTaskMutation.data,
    reset: createTaskMutation.reset,
  };
}
