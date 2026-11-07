import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select";
import { useAllUsers } from "../model/use-all-users";

interface TasksUserFilterSelectProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  noneLabel?: string;
}

export function TasksUserFilterSelect({
  value,
  onValueChange,
  placeholder = "Выберите пользователя",
  noneLabel = "Все пользователи",
}: TasksUserFilterSelectProps) {
  const { data: users = [], isPending } = useAllUsers();

  const handleChange = (nextValue: string) => {
    onValueChange(nextValue === "all" ? null : nextValue);
  };

  return (
    <Select value={value ?? "all"} onValueChange={handleChange} disabled={isPending && users.length === 0}>
      <SelectTrigger className="w-60">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{noneLabel}</SelectItem>
        {isPending && users.length === 0 ? (
          <SelectItem value="loading" disabled>
            Загрузка...
          </SelectItem>
        ) : (
          users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.username || user.email}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}


