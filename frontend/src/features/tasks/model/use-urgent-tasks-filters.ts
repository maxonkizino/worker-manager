import { useState } from "react";
import type { TaskStatus } from "../lib/types";

const DEFAULT_HOURS = 24;

export function useUrgentTasksFilters() {
  const [hours, setHours] = useState<number>(DEFAULT_HOURS);
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  const updateHours = (value: number) => {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      return;
    }
    const clamped = Math.min(Math.max(1, Math.round(value)), 168);
    setHours(clamped);
  };

  const clearFilters = () => {
    setHours(DEFAULT_HOURS);
    setStatus(null);
    setAssigneeId(null);
  };

  return {
    hours,
    setHours: updateHours,
    status,
    setStatus,
    assigneeId,
    setAssigneeId,
    clearFilters,
    DEFAULT_HOURS,
  };
}


