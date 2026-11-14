import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { employeeKeys, useSettings } from "@/entities/employee";
import { apiRequest } from "@/shared/api";
import type { Settings } from "@/shared/api/types";
import { canEditSettings } from "@/shared/lib/roles";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { ListPageLayout } from "@/widgets/list-page-layout";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";

const schema = z.object({
  usefulTimeFactor: z.string(),
  overloadThreshold: z.string(),
  underloadThreshold: z.string(),
  alpha: z.string(),
  beta: z.string(),
  gamma: z.string(),
  delta: z.string(),
  horizonDays: z.coerce.number().int().positive(),
});

type FormValues = z.infer<typeof schema>;

export function Component() {
  const { session } = useSession();
  const allowed = canEditSettings(session?.roles);
  const { data: settings } = useSettings();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      usefulTimeFactor: "0.8",
      overloadThreshold: "1.1",
      underloadThreshold: "0.6",
      alpha: "1",
      beta: "1",
      gamma: "1",
      delta: "1",
      horizonDays: 14,
    },
  });

  useEffect(() => {
    if (!settings) return;
    form.reset({
      usefulTimeFactor: String(settings.usefulTimeFactor),
      overloadThreshold: String(settings.overloadThreshold),
      underloadThreshold: String(settings.underloadThreshold),
      alpha: String(settings.alpha),
      beta: String(settings.beta),
      gamma: String(settings.gamma),
      delta: String(settings.delta),
      horizonDays: settings.horizonDays,
    });
  }, [form, settings]);

  const save = useMutation({
    mutationFn: (values: FormValues) =>
      apiRequest<Settings>("/settings", { method: "PUT", body: values }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.settings });
    },
  });

  if (!allowed) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <ListPageLayout
      title="Настройки расчёта"
      description="Веса и пороги для оценки нагрузки (только ADMIN)"
    >
      <form
        className="grid gap-3 md:grid-cols-2"
        onSubmit={form.handleSubmit((v) => save.mutate(v))}
      >
        {(
          [
            ["usefulTimeFactor", "Коэф. полезного времени"],
            ["overloadThreshold", "Порог перегрузки"],
            ["underloadThreshold", "Порог недогрузки"],
            ["alpha", "α"],
            ["beta", "β"],
            ["gamma", "γ"],
            ["delta", "δ"],
            ["horizonDays", "Горизонт (дни)"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-1">
            <Label>{label}</Label>
            <Input
              type={key === "horizonDays" ? "number" : "text"}
              {...form.register(key, key === "horizonDays" ? { valueAsNumber: true } : undefined)}
            />
          </div>
        ))}
        <div className="md:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            Сохранить
          </Button>
        </div>
      </form>
    </ListPageLayout>
  );
}
