import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select.tsx";

interface UsersRoleFilterSelectProps {
    value: string | null;
    onValueChange: (value: string | null) => void;
}

export function UsersRoleFilterSelect({ value, onValueChange }: UsersRoleFilterSelectProps) {
    return (
        <Select value={value || "all"} onValueChange={(val) => onValueChange(val === "all" ? null : val)}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Фильтр по роли" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value="ROLE_USER">Пользователь</SelectItem>
                <SelectItem value="ROLE_ADMIN">Администратор</SelectItem>
            </SelectContent>
        </Select>
    );
}
