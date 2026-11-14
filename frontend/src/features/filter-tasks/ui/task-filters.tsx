import { Input } from "@/shared/ui/kit/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { useProjectsList } from "@/entities/project";

type Props = {
  projectId?: string;
  onProjectId: (value?: string) => void;
  status: string;
  onStatus: (value: string) => void;
  priority: string;
  onPriority: (value: string) => void;
  search: string;
  onSearch: (value: string) => void;
};

export function TaskFilters({
  projectId,
  onProjectId,
  status,
  onStatus,
  priority,
  onPriority,
  search,
  onSearch,
}: Props) {
  const { data: projects = [] } = useProjectsList();

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Input
        placeholder="Поиск по названию"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <Select
        value={projectId ?? "all"}
        onValueChange={(v) => onProjectId(v === "all" ? undefined : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Проект" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все проекты</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={status || "all"} onValueChange={(v) => onStatus(v === "all" ? "" : v)}>
        <SelectTrigger>
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          {["CREATED", "ASSIGNED", "IN_PROGRESS", "DONE", "CANCELLED"].map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={priority || "all"}
        onValueChange={(v) => onPriority(v === "all" ? "" : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Приоритет" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все приоритеты</SelectItem>
          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
