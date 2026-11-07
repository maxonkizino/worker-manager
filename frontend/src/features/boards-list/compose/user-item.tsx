
import { Button } from "@/shared/ui/kit/button.tsx";
import { ApiSchemas } from "@/shared/api/schema";




interface UserItemProps {
    user: ApiSchemas["UserResponse"];
    onDelete: (userId: string) => void;
    isDeleting?: boolean;
    className?: string;
}

export function UserItem({ user, onDelete, isDeleting, className }: UserItemProps) {
    return (
        <div className={`flex justify-between items-center p-4 border rounded-lg ${className}`}>
            <div>
                <h3 className="font-semibold">{user.username}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm">Роли: {user.roles.join(", ")}</p>
                <p className="text-sm">Статус: {user.status}</p>
            </div>
            <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(user.id);
                }}
            >
                {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
        </div>
    );
}