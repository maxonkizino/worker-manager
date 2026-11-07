import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";

export type BoardsSortOption =
  | "createdAt"
  | "updatedAt"
  | "lastOpenedAt"
  | "name";

interface BoardsSortSelectProps {
  value: BoardsSortOption;
  onValueChange: (value: BoardsSortOption) => void;
}

export function BoardsSortSelect({
  value,
  onValueChange,
}: BoardsSortSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id="sort" className="w-full">
        <SelectValue placeholder="Сортировка" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="lastOpenedAt">По дате открытия</SelectItem>
        <SelectItem value="createdAt">По дате создания</SelectItem>
        <SelectItem value="updatedAt">По дате обновления</SelectItem>
        <SelectItem value="name">По имени</SelectItem>
      </SelectContent>
    </Select>
  );
}
