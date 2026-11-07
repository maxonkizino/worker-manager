import { useState } from "react";
import { TaskStatus, TaskPriority, Department } from "../lib/types";

export function useTasksFilters() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [priority, setPriority] = useState<TaskPriority | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [sort, setSort] = useState("createdAt,desc");

  const clearFilters = () => {
    setSearch("");
    setStatus(null);
    setPriority(null);
    setDepartment(null);
    setAssigneeId(null);
    setCreatorId(null);
    setSort("createdAt,desc");
  };

  return {
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    department,
    setDepartment,
    assigneeId,
    setAssigneeId,
    creatorId,
    setCreatorId,
    sort,
    setSort,
    clearFilters,
  };
}
