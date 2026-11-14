import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api";
import type { Task } from "@/shared/api/types";
import { taskKeys } from "@/entities/task";
import { useEmployeesList, UserAvatar } from "@/entities/employee";
import { Button } from "@/shared/ui/kit/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { useState } from "react";

export function AssignTaskForm({ taskId }: { taskId: string }) {
  const [employeeId, setEmployeeId] = useState<string>("");
  const queryClient = useQueryClient();
  const { data: employees = [] } = useEmployeesList();

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<Task>(`/tasks/${taskId}/assignment`, {
        method: "POST",
        body: { employeeId },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
  });

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Select value={employeeId} onValueChange={setEmployeeId}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Выберите исполнителя" />
        </SelectTrigger>
        <SelectContent>
          {employees.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              <span className="flex items-center gap-2">
                <UserAvatar
                  name={e.fullName}
                  employeeId={e.id}
                  avatarPreset={e.avatarPreset}
                  customAvatar={e.customAvatar}
                  avatarRevision={e.avatarRevision}
                  className="size-6 text-[9px]"
                />
                {e.fullName}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        disabled={!employeeId || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        Назначить
      </Button>
    </div>
  );
}
