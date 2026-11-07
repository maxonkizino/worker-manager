import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Textarea } from "@/shared/ui/kit/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select";
import { Label } from "@/shared/ui/kit/label";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/kit/alert";
import { AlertCircle } from "lucide-react";
import { useUpdateTask } from "../model/use-update-task";
import { useNavigate } from "react-router-dom";
import type { components } from "@/shared/api/schema/generated";
import { TaskPriority, Department, TaskStatus } from "../lib/types";

type TaskResponse = components["schemas"]["TaskResponse"];
type UpdateTaskRequest = components["schemas"]["UpdateTaskRequest"];

type FormValues = {
  title?: string | null;
  description?: string | null;
  priority?: TaskPriority | null;
  status?: TaskStatus | null;
  department?: Department | null;
  dueDate?: string | null;
  tagsInput?: string | null;
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const toIsoString = (value?: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

interface EditTaskFormProps {
  task: TaskResponse;
  onCancel: () => void;
}

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
};

const departmentLabels: Record<Department, string> = {
  IT: "IT",
  HR: "HR",
  FINANCE: "Финансы",
  MARKETING: "Маркетинг",
  SALES: "Продажи",
  CUSTOMER_SERVICE: "Служба поддержки",
  PRODUCTION: "Производство",
  LOGISTICS: "Логистика",
  RESEARCH_AND_DEVELOPMENT: "R&D",
  OTHER: "Другое",
};

const statusLabels: Record<TaskStatus, string> = {
  AVAILABLE: "Доступна",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершена",
  BLOCKED: "Заблокирована",
};

export function EditTaskForm({ task, onCancel }: EditTaskFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      title: task.title ?? "",
      description: task.description ?? "",
      priority: task.priority ?? null,
      status: task.status ?? null,
      department: task.department ?? null,
      dueDate: toDateTimeLocal(task.dueDate),
      tagsInput: (task.tags ?? []).join(", "),
    },
  });

  const navigate = useNavigate();

  const { updateTask, isPending, error } = useUpdateTask(task.id!, () => {
    navigate("/tasks"); // Navigate back to tasks list
  });

  const onSubmit = (data: FormValues) => {
    const payload: UpdateTaskRequest = {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      priority: (data.priority ?? undefined) as UpdateTaskRequest["priority"],
      status: (data.status ?? undefined) as UpdateTaskRequest["status"],
      department: (data.department ?? undefined) as UpdateTaskRequest["department"],
      dueDate: toIsoString(data.dueDate ?? undefined),
      tags: data.tagsInput
        ? data.tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined,
    };

    updateTask(payload);
  };

  useEffect(() => {
    reset({
      title: task.title ?? "",
      description: task.description ?? "",
      priority: task.priority ?? null,
      status: task.status ?? null,
      department: task.department ?? null,
      dueDate: toDateTimeLocal(task.dueDate),
      tagsInput: (task.tags ?? []).join(", "),
    });
  }, [task, reset]);

  return (
    <form key={task.id} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>
            {error.message || "Не удалось обновить задачу"}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="title" className="block mb-2">Название задачи</Label>
        <Input
          id="title"
          className="mt-1"
          {...register("title", { required: "Название задачи обязательно" })}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description" className="block mb-2">Описание</Label>
        <Textarea
          id="description"
          className="mt-1"
          rows={3}
          {...register("description")}
        />
      </div>

      <div>
        <Label htmlFor="priority" className="block mb-2">Приоритет</Label>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <Select
              value={field.value ?? undefined}
              onValueChange={(value: TaskPriority) => field.onChange(value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Выберите приоритет" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityLabels).map(([priority, label]) => (
                  <SelectItem key={priority} value={priority}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <Label htmlFor="status" className="block mb-2">Статус</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              value={field.value ?? undefined}
              onValueChange={(value: TaskStatus) => field.onChange(value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <Label htmlFor="department" className="block mb-2">Отдел</Label>
        <Controller
          control={control}
          name="department"
          render={({ field }) => (
            <Select
              value={field.value ?? undefined}
              onValueChange={(value: Department) => field.onChange(value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Выберите отдел" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(departmentLabels).map(([department, label]) => (
                  <SelectItem key={department} value={department}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <Label htmlFor="dueDate" className="block mb-2">Срок выполнения</Label>
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <Input
              id="dueDate"
              type="datetime-local"
              className="mt-1"
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value || null)}
            />
          )}
        />
      </div>

      <div>
        <Label htmlFor="tags" className="block mb-2">Теги (через запятую)</Label>
        <Controller
          control={control}
          name="tagsInput"
          render={({ field }) => (
            <Input
              id="tags"
              placeholder="urgent, backend, frontend"
              className="mt-1"
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value)}
            />
          )}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Сохранить"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
