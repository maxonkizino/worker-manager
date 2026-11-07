import { Input } from "@/shared/ui/kit/input.tsx";
import { Search } from "lucide-react";

interface UsersSearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

export function UsersSearchInput({ value, onChange }: UsersSearchInputProps) {
    return (
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Поиск пользователей..."
                className="pl-8 w-64"
            />
        </div>
    );
}