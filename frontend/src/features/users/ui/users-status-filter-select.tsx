import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select.tsx";

interface UsersStatusFilterSelectProps {
    value: string | null;
    onValueChange: (value: string | null) => void;
}

export function UsersStatusFilterSelect({ value, onValueChange }: UsersStatusFilterSelectProps) {
    return (
        <Select value={value || "all"} onValueChange={(val) => onValueChange(val === "all" ? null : val)}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="ACTIVE">Активные</SelectItem>
                <SelectItem value="INACTIVE">Неактивные</SelectItem>
                <SelectItem value="PENDING">Ожидающие</SelectItem>
            </SelectContent>
        </Select>
    );
}