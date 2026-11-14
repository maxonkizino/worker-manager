import { useMemo, useState } from "react";
import type { TaskListFilters } from "@/entities/task";
import type { TaskPriority, TaskStatus } from "@/shared/api/types";

export function useTaskFilters() {
  const [projectId, setProjectId] = useState<string>();
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [search, setSearch] = useState("");

  const filters = useMemo<TaskListFilters>(
    () => ({
      projectId: projectId || undefined,
      status: status || undefined,
      priority: priority || undefined,
      search: search.trim() || undefined,
    }),
    [priority, projectId, search, status],
  );

  return {
    filters,
    projectId,
    setProjectId,
    status,
    setStatus,
    priority,
    setPriority,
    search,
    setSearch,
  };
}
