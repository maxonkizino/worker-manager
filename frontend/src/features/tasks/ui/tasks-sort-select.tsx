import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select";

interface TasksSortSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const sortOptions = [
  { value: "createdAt,desc", label: "Дата создания (новые)" },
  { value: "createdAt,asc", label: "Дата создания (старые)" },
  { value: "dueDate,asc", label: "Срок выполнения (ближайшие)" },
  { value: "dueDate,desc", label: "Срок выполнения (дальние)" },
  { value: "priority,desc", label: "Приоритет (высокий)" },
  { value: "priority,asc", label: "Приоритет (низкий)" },
  { value: "status,asc", label: "Статус (А-Я)" },
  { value: "status,desc", label: "Статус (Я-А)" },
];

export function TasksSortSelect({ value, onValueChange }: TasksSortSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-60">
        <SelectValue placeholder="Сортировка" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
