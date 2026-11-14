import { useState } from "react";
import { useProjectsList, useProjectProposals } from "@/entities/project";
import { RunOptimizationForm } from "@/features/run-optimization";
import {
  ProposalActions,
  useProposalDetail,
} from "@/features/apply-proposal";
import { ListPageLayout } from "@/widgets/list-page-layout";
import { canRunOptimization } from "@/shared/lib/roles";
import { useSession } from "@/shared/model/session";
import { RequireAccess } from "@/shared/ui/require-access";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";

export function Component() {
  const { session } = useSession();
  return (
    <RequireAccess allow={canRunOptimization(session?.roles)}>
      <OptimizationPage />
    </RequireAccess>
  );
}

function OptimizationPage() {
  const { data: projects = [] } = useProjectsList();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [selectedProposalId, setSelectedProposalId] = useState<string>();
  const { data: proposals = [] } = useProjectProposals(projectId);
  const { data: detail } = useProposalDetail(selectedProposalId);

  return (
    <ListPageLayout
      title="Оптимизация распределения"
      description="Создание предложений и применение вариантов"
    >
      <div className="space-y-6">
        <div className="space-y-4 rounded border p-4">
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="max-w-md">
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
          <RunOptimizationForm
            defaultProjectId={projectId}
            onCreated={(id) => setSelectedProposalId(id)}
          />
        </div>
        <div className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Предложения по проекту</h2>
          <ul className="divide-y text-sm">
            {proposals.map((p) => (
              <li key={p.id} className="py-2">
                <button
                  type="button"
                  className="text-left text-teal-800 hover:underline"
                  onClick={() => setSelectedProposalId(p.id)}
                >
                  {p.status} · назначено {p.assignedCount} · пропусков{" "}
                  {p.unassignedCount}
                </button>
              </li>
            ))}
            {proposals.length === 0 ? (
              <li className="text-slate-500">Нет предложений</li>
            ) : null}
          </ul>
        </div>
        {selectedProposalId ? (
          <div className="space-y-3 rounded border p-4">
            <h2 className="font-semibold">Детали предложения</h2>
            {detail ? (
              <>
                <p className="text-sm text-slate-600">
                  Статус: {detail.status} · вариантов: {detail.variants.length}
                </p>
                <ul className="text-sm">
                  {detail.variants.map((v) => (
                    <li key={v.id} className="py-1">
                      {v.kind}: {v.assignments.length} назначений, score{" "}
                      {v.objectiveScore}
                    </li>
                  ))}
                </ul>
                <ProposalActions proposalId={selectedProposalId} />
              </>
            ) : (
              <p>Загрузка...</p>
            )}
          </div>
        ) : null}
      </div>
    </ListPageLayout>
  );
}
