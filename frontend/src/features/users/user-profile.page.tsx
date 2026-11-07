import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/kit/button";
import { BoardsSidebar } from "@/features/boards-list/ui/task/boards-sidebar";
import {
    UserPageLayout,
    UserPageLayoutContent,
    UserPageLayoutHeader,
} from "@/features/users/ui/user-page-layout";
import { EditProfileForm } from "@/features/users/edit-profile-form";
import { useUserProfile } from "./model/use-user-profile";
import { InfoItem } from "@/shared/ui/kit/info-item";
import { ArrowLeft, Edit3, Loader2 } from "lucide-react";
import { useUpdateUser } from "@/features/users/model/use-update-user";

function ProfileEditPage() {
    const { data: user, isLoading: isUserLoading } = useUserProfile();
    const [isEditing, setIsEditing] = useState(false); // Форма редактирования не открыта по умолчанию
    const { mutate: updateUser, isPending: isUpdatePending, error: updateError } = useUpdateUser(
        user?.id || "", // userId
        () => setIsEditing(false), // onSuccess
    );

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <UserPageLayout
            sidebar={<BoardsSidebar />}
            header={
                <UserPageLayoutHeader
                    title={
                        <>
                            <Button variant="ghost" size="icon" asChild>
                                <Link to="/boards">
                                    <ArrowLeft className="w-4 h-4" />
                                </Link>
                            </Button>
                            <span className="ml-2">
                {isUserLoading ? "Загрузка..." : `${user?.firstName || ""} ${user?.lastName || ""}`}
              </span>
                        </>
                    }
                    description="Редактирование вашего профиля"
                    actions={
                        !isEditing && (
                            <Button onClick={() => setIsEditing(true)} variant="outline">
                                <Edit3 className="w-4 h-4 mr-2" />
                                Редактировать
                            </Button>
                        )
                    }
                />
            }
        >
            <UserPageLayoutContent>
                <div className="max-w-4xl mx-auto">
                    {isUserLoading ? (
                        <div className="flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : !user ? (
                        <div className="text-red-500">Ошибка загрузки данных пользователя</div>
                    ) : isEditing ? (
                        <EditProfileForm
                            user={user}
                            onCancel={handleCancel}
                            isPending={isUpdatePending}
                            error={updateError as Error | null}
                            updateUser={(args) => updateUser(args.body, { params: { path: { id: user?.id || "" } } })}
                            key={user.id}
                        />
                    ) : (
                        <div className="space-y-4">
                            <InfoItem label="Имя пользователя" value={user.username} />
                            <InfoItem label="Электронная почта" value={user.email} />
                            <InfoItem label="Имя" value={user.firstName || "Не указано"} />
                            <InfoItem label="Фамилия" value={user.lastName || "Не указано"} />
                            <InfoItem label="Роли" value={user.roles.join(", ") || "Нет ролей"} />
                            
                        </div>
                    )}
                </div>
            </UserPageLayoutContent>
        </UserPageLayout>
    );
}

export const Component = ProfileEditPage;