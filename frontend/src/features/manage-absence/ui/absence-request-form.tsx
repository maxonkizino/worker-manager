import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/shared/api";
import type { Absence, AbsenceType } from "@/shared/api/types";
import { employeeKeys } from "@/entities/employee";
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

const schema = z.object({
  type: z.enum([
    "VACATION",
    "SICK_LEAVE",
    "BUSINESS_TRIP",
    "STUDY_LEAVE",
    "OTHER",
  ]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AbsenceRequestForm() {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "VACATION", startDate: "", endDate: "" },
  });

  const mutation = useMutation({
    mutationFn: (body: FormValues) =>
      apiRequest<Absence>("/absences", {
        method: "POST",
        body,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.absences });
      form.reset({ type: "VACATION", startDate: "", endDate: "" });
    },
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
    >
      <div className="space-y-2">
        <Label>Тип</Label>
        <Select
          value={form.watch("type") as AbsenceType}
          onValueChange={(v) => form.setValue("type", v as AbsenceType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              ["VACATION", "Отпуск"],
              ["SICK_LEAVE", "Больничный"],
              ["BUSINESS_TRIP", "Командировка"],
              ["STUDY_LEAVE", "Учёба"],
              ["OTHER", "Другое"],
            ].map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>С</Label>
        <Input type="date" {...form.register("startDate")} />
      </div>
      <div className="space-y-2">
        <Label>По</Label>
        <Input type="date" {...form.register("endDate")} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Комментарий</Label>
        <Textarea rows={2} {...form.register("comment")} />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        Подать заявку
      </Button>
    </form>
  );
}
