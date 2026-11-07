import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select";
import { TaskStatus } from "../lib/types";

interface TasksStatusFilterSelectProps {
  value: TaskStatus | null;
  onValueChange: (value: TaskStatus | null) => void;
}

const statusLabels: Record<TaskStatus, string> = {
  AVAILABLE: "Доступные",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершенные",
  BLOCKED: "Заблокированные",
};

export function TasksStatusFilterSelect({ value, onValueChange }: TasksStatusFilterSelectProps) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(value) => onValueChange(value === "all" ? null : (value as TaskStatus))}
    >
      <SelectTrigger className="w-60">
        <SelectValue placeholder="Статус" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все статусы</SelectItem>
        {Object.entries(statusLabels).map(([status, label]) => (
          <SelectItem key={status} value={status}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
