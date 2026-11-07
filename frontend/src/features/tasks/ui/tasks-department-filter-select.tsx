import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select";
import { Department } from "../lib/types";

interface TasksDepartmentFilterSelectProps {
  value: Department | null;
  onValueChange: (value: Department | null) => void;
}

const departmentLabels: Record<Department, string> = {
  IT: "IT",
  HR: "HR",
  FINANCE: "Финансы",
  MARKETING: "Маркетинг",
  SALES: "Продажи",
  CUSTOMER_SERVICE: "Служба поддержки",
  PRODUCTION: "Производство",
  LOGISTICS: "Логистика",
  RESEARCH_AND_DEVELOPMENT: "R&D",
  OTHER: "Другое",
};

export function TasksDepartmentFilterSelect({ value, onValueChange }: TasksDepartmentFilterSelectProps) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(value) => onValueChange(value === "all" ? null : (value as Department))}
    >
      <SelectTrigger className="w-60">
        <SelectValue placeholder="Отдел" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все отделы</SelectItem>
        {Object.entries(departmentLabels).map(([department, label]) => (
          <SelectItem key={department} value={department}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
