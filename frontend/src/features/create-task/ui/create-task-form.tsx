import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/shared/api";
import type { Task, TaskPriority } from "@/shared/api/types";
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
import { useProjectsList } from "@/entities/project";

const schema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(250),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  plannedStart: z.string().optional(),
  plannedEnd: z.string().optional(),
  estimatedHours: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function CreateTaskForm({ onCreated }: { onCreated?: () => void }) {
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjectsList();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectId: projects[0]?.id ?? "",
      title: "",
      priority: "MEDIUM",
      estimatedHours: "8",
    },
  });

  const mutation = useMutation({
    mutationFn: (body: FormValues) =>
      apiRequest<Task>("/tasks", {
        method: "POST",
        body: {
          ...body,
          estimatedHours: Number(body.estimatedHours),
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      form.reset();
      onCreated?.();
    },
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
    >
      <div className="space-y-2 md:col-span-2">
        <Label>Проект</Label>
        <Select
          value={form.watch("projectId")}
          onValueChange={(v) => form.setValue("projectId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите проект" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Название</Label>
        <Input {...form.register("title")} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Описание</Label>
        <Textarea rows={3} {...form.register("description")} />
      </div>
      <div className="space-y-2">
        <Label>Приоритет</Label>
        <Select
          value={form.watch("priority") as TaskPriority}
          onValueChange={(v) => form.setValue("priority", v as TaskPriority)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Оценка, ч</Label>
        <Input {...form.register("estimatedHours")} />
      </div>
      <div className="space-y-2">
        <Label>Начало</Label>
        <Input type="date" {...form.register("plannedStart")} />
      </div>
      <div className="space-y-2">
        <Label>Окончание</Label>
        <Input type="date" {...form.register("plannedEnd")} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={mutation.isPending}>
          Создать задачу
        </Button>
      </div>
    </form>
  );
}
