import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeKeys, useAbsencesList } from "@/entities/employee";
import { AbsenceRequestForm } from "@/features/manage-absence";
import { ListPageLayout } from "@/widgets/list-page-layout";
import { apiRequest } from "@/shared/api";
import type { Absence } from "@/shared/api/types";
import { useSession } from "@/shared/model/session";
import { canManageAbsences, canRequestAbsence, canViewAbsences } from "@/shared/lib/roles";
import { RequireAccess } from "@/shared/ui/require-access";
import { Button } from "@/shared/ui/kit/button";

export function Component() {
  const { session } = useSession();
  const roles = session?.roles;

  return (
    <RequireAccess allow={canViewAbsences(roles)}>
      <AbsencesPage
        canRequest={canRequestAbsence(roles)}
        canApprove={canManageAbsences(roles)}
      />
    </RequireAccess>
  );
}

function AbsencesPage({ canRequest, canApprove }: { canRequest: boolean; canApprove: boolean }) {
  const { data: absences = [], isPending } = useAbsencesList();
  const queryClient = useQueryClient();

  const approve = useMutation({
    mutationFn: (id: string) =>
      apiRequest<Absence>(`/absences/${id}/approve`, { method: "POST", body: {} }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.absences });
    },
  });

  const reject = useMutation({
    mutationFn: (id: string) =>
      apiRequest<Absence>(`/absences/${id}/reject`, {
        method: "POST",
        body: { decisionComment: "Отклонено" },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.absences });
    },
  });

  return (
    <ListPageLayout
      title="Отсутствия"
      description="Заявки на отпуск и согласование руководителем"
    >
      {canRequest ? (
        <section className="mb-6">
          <h2 className="mb-2 font-semibold">Новая заявка</h2>
          <AbsenceRequestForm />
        </section>
      ) : null}
      {isPending ? <p>Загрузка...</p> : null}
      <ul className="divide-y text-sm">
        {absences.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-2 py-3"
          >
            <div>
              <p className="font-medium">
                {a.type} · {a.startDate} — {a.endDate}
              </p>
              <p className="text-slate-600">{a.status}</p>
            </div>
            {canApprove && a.status === "PENDING" ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => approve.mutate(a.id)}>
                  Одобрить
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reject.mutate(a.id)}
                >
                  Отклонить
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </ListPageLayout>
  );
}
