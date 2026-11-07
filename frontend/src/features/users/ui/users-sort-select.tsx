import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select.tsx";

interface UsersSortSelectProps {
    value: string;
    onValueChange: (value: string) => void;
}

export function UsersSortSelect({ value, onValueChange }: UsersSortSelectProps) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="createdAt-desc">Новые сначала</SelectItem>
                <SelectItem value="createdAt-asc">Старые сначала</SelectItem>
                <SelectItem value="username-asc">По имени (A-Z)</SelectItem>
                <SelectItem value="username-desc">По имени (Z-A)</SelectItem>
            </SelectContent>
        </Select>
    );
}