import { Input } from "@/shared/ui/kit/input";

interface TasksSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TasksSearchInput({ value, onChange }: TasksSearchInputProps) {
  return (
    <Input
      placeholder="Поиск задач..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-60"
    />
  );
}
