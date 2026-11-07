// features/users/ui/user/user-profile-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Mail, User as UserIcon, Calendar, Shield } from "lucide-react";
import type { components } from "@/shared/api/schema";

type User = components["schemas"]["User"];

interface UserProfileCardProps {
  user: User;
  onEdit: () => void;
}

export function UserProfileCard({ user, onEdit }: UserProfileCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Не указано";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-2xl">Профиль пользователя</CardTitle>
        <Button onClick={onEdit} variant="outline">
          Редактировать
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Аватар и основная информация */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        {/* Контактная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Контактная информация
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Права доступа
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Роли</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {user.roles?.map((role) => (
                      <Badge 
                        key={role} 
                        variant={role === "ADMIN" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {role.toLowerCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Системная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Системная информация
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Дата создания</p>
                  <p>{formatDate(user.createdAt)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">ID пользователя</p>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                  {user.id}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Статус</h3>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  user.status === "ACTIVE" 
                    ? "bg-green-500" 
                    : user.status === "INACTIVE" 
                    ? "bg-yellow-500" 
                    : "bg-red-500"
                }`}
              />
              <span className="capitalize">
                {user.status === "ACTIVE" 
                  ? "Активный" 
                  : user.status === "INACTIVE" 
                  ? "Неактивный" 
                  : "Заблокированный"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}