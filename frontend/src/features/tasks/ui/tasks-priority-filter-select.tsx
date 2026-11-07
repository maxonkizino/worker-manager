import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select";
import { TaskPriority } from "../lib/types";

interface TasksPriorityFilterSelectProps {
  value: TaskPriority | null;
  onValueChange: (value: TaskPriority | null) => void;
}

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
};

export function TasksPriorityFilterSelect({ value, onValueChange }: TasksPriorityFilterSelectProps) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(value) => onValueChange(value === "all" ? null : (value as TaskPriority))}
    >
      <SelectTrigger className="w-60">
        <SelectValue placeholder="Приоритет" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все приоритеты</SelectItem>
        {Object.entries(priorityLabels).map(([priority, label]) => (
          <SelectItem key={priority} value={priority}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
