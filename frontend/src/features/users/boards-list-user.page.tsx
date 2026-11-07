import { useState, useEffect, RefObject } from "react";
import { Button } from "@/shared/ui/kit/button.tsx";
import { PlusIcon } from "lucide-react";
import { useUsersList } from "./model/use-users-list.ts";
import { useUsersFilters } from "./model/use-users-filters.ts";
import { useDebouncedValue } from "@/shared/lib/react.ts";
import { useCreateUser } from "../boards-list/model/user/use-create-user.ts";
import {
    UsersListLayout,
    UsersListLayoutContent,
    UsersListLayoutFilters,
    UsersListLayoutHeader,
} from "./ui/users-list-layout.tsx";
import { ViewMode, ViewModeToggle } from "../boards-list/ui/view-mode-toggle.tsx";
import { UsersSortSelect } from "./ui/users-sort-select.tsx";
import { UsersSearchInput } from "./ui/users-search-input.tsx";
import { UsersStatusFilterSelect } from "./ui/users-status-filter-select.tsx";
import { UsersRoleFilterSelect } from "./ui/users-role-filter-select.tsx";
import { UserItem } from "../boards-list/compose/user-item.tsx";
import { UserCard } from "../boards-list/compose/user-card.tsx";
import { BoardsSidebar } from "@/features/boards-list/ui/task/boards-sidebar.tsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/kit/dialog.tsx";
import { CreateUserForm } from "./ui/create-user-form.tsx";
import { Link } from "react-router-dom";
import { ApiSchemas } from "@/shared/api/schema";
import {useDeleteUser} from "@/features/users/model/use-delete-user.ts";

function UsersListPage() {
    const usersFilters = useUsersFilters();
    const usersQuery = useUsersList({
        sort: usersFilters.sort,
        username: useDebouncedValue(usersFilters.search, 300),
        role: usersFilters.role as "ROLE_USER" | "ROLE_ADMIN" | null,
        status: usersFilters.status as "ACTIVE" | "INACTIVE" | "PENDING" | null,
    });

    // Хук удаления
    const { deleteUser, isPending: isDeleting } = useDeleteUser();
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const handleDelete = (userId: string) => {
        console.log(userId);
        setDeletingUserId(userId);
        deleteUser(userId);
    };

    const createUserMutation = useCreateUser();
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<ApiSchemas["CreateUserRequest"]>({
        username: "",
        password: "",
        email: "",
        firstName: "",
        lastName: "",
        roles: ["ROLE_USER"],
    });

    useEffect(() => {
        if (createUserMutation.isSuccess) {
            setIsOpen(false);
            createUserMutation.reset();
            setFormData({
                username: "",
                password: "",
                email: "",
                firstName: "",
                lastName: "",
                roles: ["ROLE_USER"],
            });
        }
    }, [createUserMutation.isSuccess]);

    const renderList = () =>
        usersQuery.users.map((user) => (
            <Link key={user.id} to={`/users/${user.id}`}>
                <UserItem
                    user={user}
                    onDelete={handleDelete}
                    isDeleting={deletingUserId === user.id && isDeleting}
                    className="mb-4 cursor-pointer hover:bg-gray-100 transition-colors"
                />
            </Link>
        ));

    const renderGrid = () =>
        usersQuery.users.map((user) => (
            <Link key={user.id} to={`/users/${user.id}`}>
                <UserCard
                    user={user}
                    onDelete={handleDelete}
                    isDeleting={deletingUserId === user.id && isDeleting}
                    className="mb-4 cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all"
                />
            </Link>
        ));

    return (
        <UsersListLayout
            sidebar={<BoardsSidebar />}
            header={
                <UsersListLayoutHeader
                    title="Пользователи"
                    description="Здесь вы можете просматривать и управлять пользователями системы"
                    actions={
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusIcon />
                                    Создать пользователя
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Создать нового пользователя</DialogTitle>
                                </DialogHeader>
                                <CreateUserForm
                                    formData={formData}
                                    setFormData={setFormData}
                                    onClose={() => setIsOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    }
                />
            }
            filters={
                <UsersListLayoutFilters
                    sort={
                        <UsersSortSelect
                            value={usersFilters.sort}
                            onValueChange={usersFilters.setSort}
                        />
                    }
                    filters={
                        <div className="flex gap-4">
                            <UsersSearchInput
                                value={usersFilters.search}
                                onChange={usersFilters.setSearch}
                            />
                            <UsersStatusFilterSelect
                                value={usersFilters.status}
                                onValueChange={usersFilters.setStatus}
                            />
                            <UsersRoleFilterSelect
                                value={usersFilters.role}
                                onValueChange={usersFilters.setRole}
                            />
                        </div>
                    }
                    actions={
                        <ViewModeToggle
                            value={viewMode}
                            onChange={(value) => setViewMode(value)}
                        />
                    }
                />
            }
        >
            <UsersListLayoutContent
                isEmpty={usersQuery.users.length === 0}
                isPending={usersQuery.isPending}
                isPendingNext={usersQuery.isFetchingNextPage}
                cursorRef={usersQuery.cursorRef as unknown as RefObject<HTMLDivElement>}
                hasCursor={usersQuery.hasNextPage}
                mode={viewMode}
                renderList={renderList}
                renderGrid={renderGrid}
            />
        </UsersListLayout>
    );
}

export const Component = UsersListPage;