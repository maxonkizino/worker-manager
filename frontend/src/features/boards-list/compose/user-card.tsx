
import { Button } from "@/shared/ui/kit/button.tsx";
import {ApiSchemas} from "@/shared/api/schema";

interface UserCardProps {
    user: ApiSchemas["UserResponse"];
    onDelete: (userId: string) => void;
    isDeleting?: boolean;
    className?: string;
}

export function UserCard({ user, onDelete, isDeleting, className }: UserCardProps) {
    return (
        <div className={`p-4 border rounded-lg shadow-sm ${className}`}>
            <h3 className="font-semibold">{user.username}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm">Роли: {user.roles.join(", ")}</p>
            <p className="text-sm">Статус: {user.status}</p>
            <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(user.id);
                }}
                className="mt-2 w-full"
            >
                {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
        </div>
    );
}