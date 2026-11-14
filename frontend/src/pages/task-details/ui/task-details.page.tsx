import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTask, useTaskComments, taskKeys } from "@/entities/task";
import { AssignTaskForm } from "@/features/assign-task";
import { apiRequest } from "@/shared/api";
import type { Task, TaskComment, TaskStatus } from "@/shared/api/types";
import { canChangeTaskStatus, canLogTime, canManageTasks, canViewTasks } from "@/shared/lib/roles";
import { useSession } from "@/shared/model/session";
import { RequireAccess } from "@/shared/ui/require-access";
import { ListPageLayout } from "@/widgets/list-page-layout";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { Textarea } from "@/shared/ui/kit/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
const timeSchema = z.object({
  workDate: z.string().min(1),
  hours: z.string().min(1),
  description: z.string().optional(),
});

type TimeForm = z.infer<typeof timeSchema>;

export function Component() {
  const { session } = useSession();
  return (
    <RequireAccess allow={canViewTasks(session?.roles)}>
      <TaskDetails />
    </RequireAccess>
  );
}

function TaskDetails() {
  const { session } = useSession();
  const roles = session?.roles;
  const { id = "" } = useParams();
  const { data: task } = useTask(id);
  const { data: comments = [] } = useTaskComments(id);
  const [commentBody, setCommentBody] = useState("");
  const queryClient = useQueryClient();

  const timeForm = useForm<TimeForm>({
    resolver: zodResolver(timeSchema),
    defaultValues: { workDate: "", hours: "1" },
  });

  const statusMutation = useMutation({
    mutationFn: (status: TaskStatus) =>
      apiRequest<Task>(`/tasks/${id}/status`, {
        method: "POST",
        body: { status },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      apiRequest<TaskComment>(`/tasks/${id}/comments`, {
        method: "POST",
        body: { body: commentBody },
      }),
    onSuccess: async () => {
      setCommentBody("");
      await queryClient.invalidateQueries({ queryKey: taskKeys.comments(id) });
    },
  });

  const timeMutation = useMutation({
    mutationFn: (values: TimeForm) =>
      apiRequest("/time-entries", {
        method: "POST",
        body: {
          taskId: id,
          workDate: values.workDate,
          hours: Number(values.hours),
          description: values.description,
        },
      }),
    onSuccess: async () => {
      timeForm.reset({ workDate: "", hours: "1" });
      await queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
    },
  });

  if (!task) {
    return <p>Загрузка задачи...</p>;
  }

  return (
    <ListPageLayout title={task.title} description={task.description ?? ""}>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-3">
          <p className="text-sm">
            Статус: <strong>{task.status}</strong> · Приоритет: {task.priority}
          </p>
          {canChangeTaskStatus(roles) ? (
            <Select onValueChange={(v) => statusMutation.mutate(v as TaskStatus)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Сменить статус" />
              </SelectTrigger>
              <SelectContent>
                {["CREATED", "ASSIGNED", "IN_PROGRESS", "DONE", "CANCELLED"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {canManageTasks(roles) ? <AssignTaskForm taskId={id} /> : null}
        </section>
        <section className="space-y-2">
          <h2 className="font-semibold">Комментарии</h2>
          <ul className="space-y-2 text-sm">
            {comments.map((c) => (
              <li key={c.id} className="rounded border p-2">
                {c.body}
              </li>
            ))}
          </ul>
          <Textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Новый комментарий"
          />
          <Button
            size="sm"
            disabled={!commentBody || commentMutation.isPending}
            onClick={() => commentMutation.mutate()}
          >
            Отправить
          </Button>
        </section>
        <section className="space-y-2 md:col-span-2">
          <h2 className="font-semibold">Учёт времени</h2>
          {canLogTime(roles) ? (
            <form
              className="grid gap-2 md:grid-cols-4"
              onSubmit={timeForm.handleSubmit((v) => timeMutation.mutate(v))}
            >
              <div>
                <Label>Дата</Label>
                <Input type="date" {...timeForm.register("workDate")} />
              </div>
              <div>
                <Label>Часы</Label>
                <Input {...timeForm.register("hours")} />
              </div>
              <div className="md:col-span-2">
                <Label>Описание</Label>
                <Input {...timeForm.register("description")} />
              </div>
              <Button type="submit" disabled={timeMutation.isPending}>
                Добавить
              </Button>
            </form>
          ) : null}
          <p className="text-sm text-slate-600">
            Факт: {task.actualHours} ч из {task.estimatedHours} ч
          </p>
        </section>
      </div>
    </ListPageLayout>
  );
}
