import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api";
import type { Task, TaskComment, TaskPriority, TaskStatus } from "@/shared/api/types";

export type TaskListFilters = {
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
};

export const taskKeys = {
  all: (filters: TaskListFilters) => ["tasks", filters] as const,
  detail: (id: string) => ["tasks", id] as const,
  comments: (id: string) => ["tasks", id, "comments"] as const,
};

function buildQuery(filters: TaskListFilters) {
  const params = new URLSearchParams();
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.search) params.set("search", filters.search);
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function useTasksList(filters: TaskListFilters = {}) {
  return useQuery({
    queryKey: taskKeys.all(filters),
    queryFn: () => apiRequest<Task[]>(`/tasks${buildQuery(filters)}`),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => apiRequest<Task>(`/tasks/${id}`),
    enabled: Boolean(id),
  });
}

export function useTaskComments(id: string) {
  return useQuery({
    queryKey: taskKeys.comments(id),
    queryFn: () => apiRequest<TaskComment[]>(`/tasks/${id}/comments`),
    enabled: Boolean(id),
  });
}
