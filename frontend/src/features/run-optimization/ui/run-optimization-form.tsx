import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/shared/api";
import { projectKeys, useProjectsList } from "@/entities/project";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";

const schema = z.object({
  projectId: z.string().uuid(),
  horizonStart: z.string().min(1),
  horizonEnd: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

type CreateProposalResponseDto = {
  proposalId: string;
};

export function RunOptimizationForm({
  defaultProjectId,
  onCreated,
}: {
  defaultProjectId?: string;
  onCreated?: (proposalId: string) => void;
}) {
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjectsList();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectId: defaultProjectId ?? projects[0]?.id ?? "",
      horizonStart: "",
      horizonEnd: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (body: FormValues) =>
      apiRequest<CreateProposalResponseDto>("/optimization/proposals", {
        method: "POST",
        body,
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: projectKeys.proposals(form.getValues("projectId")),
      });
      onCreated?.(data.proposalId);
    },
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-3"
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
    >
      <div className="space-y-2 md:col-span-3">
        <Label>Проект</Label>
        <Select
          value={form.watch("projectId")}
          onValueChange={(v) => form.setValue("projectId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Проект" />
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
      <div className="space-y-2">
        <Label>Горизонт с</Label>
        <Input type="date" {...form.register("horizonStart")} />
      </div>
      <div className="space-y-2">
        <Label>Горизонт по</Label>
        <Input type="date" {...form.register("horizonEnd")} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Расчёт..." : "Создать предложение"}
        </Button>
      </div>
    </form>
  );
}
