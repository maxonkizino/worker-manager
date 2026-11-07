import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Badge } from "@/shared/ui/kit/badge";
import { Trash2, Edit3, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { useSubscribeTask } from "../model/use-subscribe-task";
import { useSession } from "@/shared/model/session";
import { useAllUsers } from "../model/use-all-users";
import type { TaskResponse, TaskStatus } from "../lib/types";
import { useNavigate } from "react-router-dom";

interface TaskCardProps {
  task: TaskResponse;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: TaskResponse) => void;
  isDeleting?: boolean;
  className?: string;
}

const STATUS_LABELS: Record<NonNullable<TaskResponse["status"]>, string> = {
  AVAILABLE: "Доступна",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершена",
  BLOCKED: "Заблокирована",
};

const STATUS_BADGES: Record<NonNullable<TaskResponse["status"]>, string> = {
  AVAILABLE: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  BLOCKED: "bg-red-100 text-red-800",
};

const PRIORITY_LABELS: Record<NonNullable<TaskResponse["priority"]>, string> = {
  LOW: "Низкий приоритет",
  MEDIUM: "Средний приоритет",
  HIGH: "Высокий приоритет",
};

const PRIORITY_BADGES: Record<NonNullable<TaskResponse["priority"]>, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-orange-100 text-orange-800",
  HIGH: "bg-red-100 text-red-800",
};

const DEPARTMENT_LABELS: Record<NonNullable<TaskResponse["department"]>, string> = {
  IT: "IT",
  HR: "HR",
  FINANCE: "Финансы",
  MARKETING: "Маркетинг",
  SALES: "Продажи",
  CUSTOMER_SERVICE: "Поддержка",
  PRODUCTION: "Производство",
  LOGISTICS: "Логистика",
  RESEARCH_AND_DEVELOPMENT: "R&D",
  OTHER: "Другое",
};

const formatDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isOverdue = (value?: string) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
};

export function TaskCard({ task, onDelete, onEdit, isDeleting, className }: TaskCardProps) {
  const { session } = useSession();
  const navigate = useNavigate();
  const currentUserId = session?.userId ?? null;
  const isAdmin = session?.roles?.includes("ROLE_ADMIN") ?? false;
  const { subscribe, unsubscribe, isPending: isSubscribing, errorMessage } = useSubscribeTask();
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task.assigneeIds ?? []);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    if (!currentUserId) return false;
    return Boolean(task.assigneeIds?.includes(currentUserId));
  });
  const [displayStatus, setDisplayStatus] = useState<TaskStatus | null>(task.status ?? null);
  const isBlocked = displayStatus === "BLOCKED";

  useEffect(() => {
    setAssigneeIds(task.assigneeIds ?? []);
    if (!currentUserId) {
      setIsSubscribed(false);
      setDisplayStatus(task.status ?? null);
      return;
    }
    setIsSubscribed(Boolean(task.assigneeIds?.includes(currentUserId)));
    setDisplayStatus(task.status ?? null);
  }, [task.assigneeIds, currentUserId, task.status]);
  const { data: users = [] } = useAllUsers();

  const usersById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );

  const assignees = useMemo<string[]>(() => {
    if (assigneeIds.length === 0) return [];
    return assigneeIds
      .map((assigneeId) => {
        const user = usersById.get(assigneeId);
        return user?.username || user?.email || assigneeId;
      })
      .filter((name): name is string => Boolean(name));
  }, [assigneeIds, usersById]);

  const creatorName = useMemo(() => {
    if (!task.creatorId) return null;
    const user = usersById.get(task.creatorId);
    return user?.username || user?.email || task.creatorId;
  }, [task.creatorId, usersById]);

  const dueDate = formatDate(task.dueDate);
  const createdAt = formatDate(task.createdAt);
  const overdue = isOverdue(task.dueDate);
  const tags: string[] = task.tags ?? [];

  const handleSubscribeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!task.id || !currentUserId || isBlocked) return;

    const nextState = !isSubscribed;
    setIsSubscribed(nextState);

    if (nextState) {
      subscribe(task.id);
      if (currentUserId) {
        setAssigneeIds((prev) =>
          prev.includes(currentUserId) ? prev : [...prev, currentUserId],
        );
      }
      setDisplayStatus("IN_PROGRESS");
    } else {
      unsubscribe(task.id);
      if (currentUserId) {
        setAssigneeIds((prev) => {
          const updated = prev.filter((id) => id !== currentUserId);
          if (updated.length === 0) {
            setDisplayStatus("AVAILABLE");
          }
          return updated;
        });
      } else {
        setDisplayStatus("AVAILABLE");
      }
    }
  };
  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onEdit?.(task);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!task.id) return;
    onDelete?.(task.id);
  };

  const handleCardClick = () => {
    if (!task.id) return;
    navigate(`/tasks/${task.id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <Card
      className={className ? `h-full ${className}` : "h-full cursor-pointer"}
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <CardTitle className="text-lg font-semibold leading-snug line-clamp-2">
                {task.title ?? "Без названия"}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {displayStatus ? (
                  <Badge className={`text-xs ${STATUS_BADGES[displayStatus]}`}>
                    {STATUS_LABELS[displayStatus]}
                  </Badge>
                ) : (
                  <Badge className="text-xs bg-gray-100 text-gray-600">Не указан</Badge>
                )}
                {task.priority && (
                  <Badge className={`text-xs ${PRIORITY_BADGES[task.priority]}`}>
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                )}
                {task.department && (
                  <Badge variant="outline" className="text-xs">
                    {DEPARTMENT_LABELS[task.department]}
                  </Badge>
                )}
                {dueDate && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${overdue ? "border-red-300 text-red-600" : "border-muted text-muted-foreground"}`}
                  >
                    {overdue ? `Просрочено: ${dueDate}` : `Срок: ${dueDate}`}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex gap-1">
                {task.id && (
                  <Button
                    variant={isSubscribed ? "default" : "outline"}
                    size="sm"
                    onClick={handleSubscribeToggle}
                    disabled={isSubscribing || isBlocked}
                    className={`h-7 w-7 p-0 ${isSubscribed ? "bg-yellow-100 text-yellow-600 border-yellow-300 hover:bg-yellow-200" : ""}`}
                    title={
                      isBlocked
                        ? "Заблокированную задачу нельзя добавить в избранное"
                        : isSubscribed
                          ? "Убрать из избранного"
                          : "Добавить в избранное"
                    }
                  >
                    <Star className={`h-3 w-3 ${isSubscribed ? "fill-yellow-400 text-yellow-500" : ""}`} />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditClick}
                    className="h-7 w-7 p-0"
                    title="Редактировать"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                )}
                {onDelete && task.id && isAdmin && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="h-7 w-7 p-0"
                    title="Удалить задачу"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {isBlocked && (
                <span className="text-xs font-semibold uppercase tracking-wide text-red-500">
                  Заблокирована
                </span>
              )}
              {errorMessage && (
                <p className="text-xs text-destructive">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>
          )}

          {assignees.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignees.slice(0, 6).map((assignee) => (
                <Badge key={assignee} variant="secondary" className="text-xs">
                  {assignee}
                </Badge>
              ))}
              {assignees.length > 6 && (
                <Badge variant="secondary" className="text-xs">
                  +{assignees.length - 6}
                </Badge>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Исполнители не назначены</div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            {creatorName && <div>Автор: {creatorName}</div>}
            {createdAt && <div>Создано: {createdAt}</div>}
          </div>

          {tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {tags.slice(0, 5).map((tag, index) => (
                <Badge key={`${tag}-${index}`} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {tags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
