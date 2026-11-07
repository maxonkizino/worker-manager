import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PathParams, ROUTES } from "@/shared/model/routes";
import { ArrowLeft, Loader2, AlertCircle, Edit3, Trash2, CheckCircle, File, Download, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/shared/ui/kit/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/kit/alert";
import {
    TaskPageLayout,
    TaskPageLayoutContent,
    TaskPageLayoutHeader,
} from "./ui/task-page-layout";
import { useTask } from "./model/use-task";
import { useDeleteTask } from "./model/use-delete-task";
import { EditTaskForm } from "./ui/edit-task-form";
import { InfoItem } from "@/shared/ui/kit/info-item";
import { Badge } from "@/shared/ui/kit/badge";
import {BoardsSidebar} from "@/features/boards-list/ui/task/boards-sidebar.tsx";
import { useTaskAttachments } from "./model/use-task-attachments";
import { useTaskComments } from "./model/use-task-comments";
import { CreateCommentForm } from "./ui/create-comment-form";
import { EditCommentForm } from "./ui/edit-comment-form";
import { useAllUsers } from "./model/use-all-users";
import { useDeleteComment } from "./model/use-delete-comment";
import { useSession } from "@/shared/model/session";
import { components } from "@/shared/api/schema/generated";
import type { TaskStatus, TaskPriority } from "./lib/types";

type AttachmentResponse = components["schemas"]["AttachmentResponse"];
type CommentResponse = components["schemas"]["CommentResponse"];

function TaskDetailsPage() {
  const params = useParams<PathParams[typeof ROUTES.TASK_DETAILS]>();
  const navigate = useNavigate();
  const taskId = params.id!;

  const { data: task, isLoading, isError } = useTask(taskId);
  const { data: attachments, isLoading: isLoadingAttachments } = useTaskAttachments(taskId);
  const { data: commentsData, isLoading: isLoadingComments } = useTaskComments(taskId);
  const { data: allUsers, isLoading: isLoadingUsers } = useAllUsers();
  const deleteTaskMutation = useDeleteTask(
    () => navigate("/tasks"),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  
  const { session } = useSession();
  const isAdmin = session?.roles?.includes("ROLE_ADMIN") || false;
  const currentUserId = session?.userId;
  
  const deleteCommentMutation = useDeleteComment(taskId, () => {
    setDeletingCommentId(null);
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderLoading = () => (
    <div className="flex justify-center items-center py-12">
      <Alert variant="default" className="max-w-md">
        <Loader2 className="w-4 h-4 animate-spin" />
        <AlertTitle>Загрузка задачи</AlertTitle>
        <AlertDescription>Пожалуйста, подождите...</AlertDescription>
      </Alert>
    </div>
  );

  const renderError = () => {
    let title = "Произошла ошибка";
    let description = "Не удалось загрузить данные задачи.";

    if (isError) {
      title = "Ошибка загрузки задачи";
      description = "Произошла ошибка при загрузке данных задачи.";
    } else if (!task) {
      title = "Задача не найдена";
      description = "Задача с указанным ID не найдена.";
    }

    return (
      <div className="flex justify-center items-center py-12">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      </div>
    );
  };

  const statusLabels: Record<TaskStatus, string> = {
    AVAILABLE: "Доступна",
    IN_PROGRESS: "В работе",
    COMPLETED: "Завершена",
    BLOCKED: "Заблокирована",
  };

  const priorityLabels: Record<TaskPriority, string> = {
    LOW: "Низкий",
    MEDIUM: "Средний",
    HIGH: "Высокий",
  };

  const statusColors: Record<TaskStatus, string> = {
    AVAILABLE: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    BLOCKED: "bg-red-100 text-red-800",
  };

  const priorityColors: Record<TaskPriority, string> = {
    LOW: "bg-gray-100 text-gray-800",
    MEDIUM: "bg-orange-100 text-orange-800",
    HIGH: "bg-red-100 text-red-800",
  };

  const currentStatus = task?.status as TaskStatus | undefined;
  const statusBadgeClass = currentStatus ? statusColors[currentStatus] : "bg-gray-100 text-gray-600";
  const statusText = currentStatus ? statusLabels[currentStatus] : "Не указан";
  const priorityKey = (task?.priority ?? null) as TaskPriority | null;
  const priorityBadgeClass = priorityKey ? priorityColors[priorityKey] : "bg-gray-100 text-gray-600";
  const priorityText = priorityKey ? priorityLabels[priorityKey] : "Не указан";

  return (
    <TaskPageLayout
      sidebar={<BoardsSidebar />}
      header={
        <TaskPageLayoutHeader
          title={
            <div className="flex items-center">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/tasks">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <span className="ml-2 text-xl font-semibold">
                {task ? task.title : "Задача"}
              </span>
            </div>
          }
          description="Детальная информация о задаче"
          actions={
            <div className="flex items-center gap-2">
              {!isEditing && task && (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="transition-colors hover:bg-blue-200/80 hover:text-blue-700"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button
                    onClick={() => deleteTaskMutation.deleteTask(taskId)}
                    variant="outline"
                    className="transition-colors hover:bg-red-500/10 hover:text-red-600"
                    disabled={deleteTaskMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteTaskMutation.isPending ? "Удаление..." : "Удалить"}
                  </Button>
                </>
              )}
            </div>
          }
        />
      }
    >
      <TaskPageLayoutContent>
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            renderLoading()
          ) : isError || !task ? (
            renderError()
          ) : (
            <>
              {deleteTaskMutation.errorMessage && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>Ошибка</AlertTitle>
                  <AlertDescription>
                    {deleteTaskMutation.errorMessage || "Ошибка при удалении задачи"}
                  </AlertDescription>
                </Alert>
              )}

              {isEditing ? (
                <EditTaskForm
                  task={task}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <InfoItem
                      label="Название"
                      value={task.title || ""}
                    />
                    {task.description && (
                      <InfoItem
                        label="Описание"
                        value={task.description}
                      />
                    )}
                    <InfoItem
                      label="Статус"
                      value={
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-xs ${statusBadgeClass}`}>
                              {statusText}
                            </Badge>
                            {currentStatus === "COMPLETED" && (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Завершена
                              </span>
                            )}
                            
                          </div>
                          
                        </div>
                      }
                    />
                    <InfoItem
                      label="Приоритет"
                      value={
                        <Badge className={`text-xs ${priorityBadgeClass}`}>
                          {priorityText}
                        </Badge>
                      }
                    />
                    <InfoItem
                      label="Отдел"
                      value={task.department || ""}
                    />
                    {task.assigneeIds && task.assigneeIds.length > 0 && (
                      <InfoItem
                        label="Исполнители"
                        value={
                          isLoadingUsers ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Загрузка...</span>
                            </div>
                          ) : (
                            <div className="flex gap-1 flex-wrap">
                              {task.assigneeIds.map((assigneeId) => {
                                const user = allUsers?.find((u) => u.id === assigneeId);
                                return (
                                  <Badge key={assigneeId} variant="secondary">
                                    {user
                                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username
                                      : assigneeId}
                                  </Badge>
                                );
                              })}
                            </div>
                          )
                        }
                      />
                    )}
                    <InfoItem
                      label="Дата создания"
                      value={new Date(task.createdAt || "").toLocaleDateString(
                        "ru-RU",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    />
                    {task.dueDate && (
                      <InfoItem
                        label="Срок выполнения"
                        value={new Date(task.dueDate || "").toLocaleDateString(
                          "ru-RU",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      />
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <InfoItem
                        label="Теги"
                        value={
                          <div className="flex gap-1 flex-wrap">
                            {task.tags?.map((tag, index) => (
                              <Badge key={index} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        }
                      />
                    )}
                    <InfoItem
                      label="Файлы"
                      value={
                        isLoadingAttachments ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Загрузка файлов...</span>
                          </div>
                        ) : attachments && attachments.length > 0 ? (
                          <div className="space-y-2">
                            {attachments.map((attachment: AttachmentResponse) => (
                              <div
                                key={attachment.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {attachment.fileName || "Без названия"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(attachment.size)}
                                      {attachment.fileType && ` • ${attachment.fileType}`}
                                    </p>
                                  </div>
                                </div>
                                {attachment.url && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="flex-shrink-0"
                                    onClick={() => window.open(attachment.url, "_blank")}
                                    title="Скачать файл"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Нет прикрепленных файлов</span>
                        )
                      }
                    />
                  </div>

                  {/* Comments Section */}
                  <div className="border-t pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Комментарии</h3>
                        {commentsData?.content && commentsData.content.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {commentsData.totalElements}
                          </Badge>
                        )}
                      </div>
                      {!isCreatingComment && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="transition-colors hover:bg-blue-200/80 hover:text-blue-700"
                          onClick={() => setIsCreatingComment(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Добавить комментарий
                        </Button>
                      )}
                    </div>
                    {isCreatingComment && (
                      <div className="mb-6 p-4 border rounded-lg bg-card">
                        <CreateCommentForm
                          taskId={taskId}
                          onSuccess={() => {
                            setIsCreatingComment(false);
                          }}
                          onCancel={() => setIsCreatingComment(false)}
                        />
                      </div>
                    )}
                    {isLoadingComments ? (
                      <div className="flex items-center gap-2 text-muted-foreground py-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Загрузка комментариев...</span>
                      </div>
                    ) : commentsData?.content && commentsData.content.length > 0 ? (
                      <div className="space-y-4">
                        {commentsData.content.map((comment: CommentResponse) => {
                          const isAuthor = comment.authorId === currentUserId;
                          const canEdit = isAuthor;
                          const canDelete = isAuthor || isAdmin;
                          const isEditingThis = editingCommentId === comment.id;
                          const isDeletingThis = deletingCommentId === comment.id && deleteCommentMutation.isPending;

                          return (
                            <div
                              key={comment.id}
                              className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                            >
                              {isEditingThis ? (
                                <EditCommentForm
                                  taskId={taskId}
                                  comment={comment}
                                  onSuccess={() => setEditingCommentId(null)}
                                  onCancel={() => setEditingCommentId(null)}
                                />
                              ) : (
                                <>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                        {comment.content}
                                      </p>
                                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        {comment.createdAt && (
                                          <span>
                                            {new Date(comment.createdAt).toLocaleString("ru-RU", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        )}
                                        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                          <span className="text-xs">(изменено)</span>
                                        )}
                                      </div>
                                    </div>
                                    {(canEdit || canDelete) && (
                                      <div className="flex items-center gap-1">
                                        {canEdit && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingCommentId(comment.id || null)}
                                            className="h-8 w-8 p-0"
                                            title="Редактировать"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </Button>
                                        )}
                                        {canDelete && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              if (window.confirm("Вы уверены, что хотите удалить этот комментарий?")) {
                                                setDeletingCommentId(comment.id || null);
                                                deleteCommentMutation.deleteComment(comment.id || "");
                                              }
                                            }}
                                            disabled={isDeletingThis}
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            title="Удалить"
                                          >
                                            {isDeletingThis ? (
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <Trash2 className="w-4 h-4" />
                                            )}
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground py-4">
                        Нет комментариев
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </TaskPageLayoutContent>
    </TaskPageLayout>
  );
}

export const Component = TaskDetailsPage;
