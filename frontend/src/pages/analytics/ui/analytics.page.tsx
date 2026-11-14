import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTeamLoad } from "@/entities/employee";
import { ListPageLayout } from "@/widgets/list-page-layout";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { canViewTeamLoad } from "@/shared/lib/roles";
import { useSession } from "@/shared/model/session";
import { RequireAccess } from "@/shared/ui/require-access";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function Component() {
  const { session } = useSession();
  return (
    <RequireAccess allow={canViewTeamLoad(session?.roles)}>
      <AnalyticsPage />
    </RequireAccess>
  );
}

function AnalyticsPage() {
  const today = new Date();
  const [from, setFrom] = useState(isoDate(today));
  const [to, setTo] = useState(isoDate(new Date(today.getTime() + 30 * 86_400_000)));
  const { data, isPending, isError } = useTeamLoad(from, to);

  const chartData = useMemo(
    () =>
      (data?.members ?? []).map((m) => ({
        name: m.employeeId.slice(0, 8),
        plan: Number(m.plannedHours),
        fact: Number(m.actualHours),
        capacity: Number(m.capacityHours),
      })),
    [data],
  );

  return (
    <ListPageLayout
      title="Аналитика нагрузки"
      description="Сравнение плановой и фактической загрузки команды"
      filters={
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>С</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>По</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      }
    >
      {isPending ? <p>Загрузка...</p> : null}
      {isError ? (
        <p className="text-sm text-slate-600">Не удалось загрузить аналитику.</p>
      ) : null}
      {!isPending && !isError && chartData.length === 0 ? (
        <p className="text-sm text-slate-600">Нет данных за выбранный период.</p>
      ) : null}
      {!isError && chartData.length > 0 ? <TeamLoadChart data={chartData} /> : null}
    </ListPageLayout>
  );
}

function TeamLoadChart({ data }: { data: { name: string; plan: number; fact: number; capacity: number }[] }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="plan" fill="#0f766e" name="План" />
          <Bar dataKey="fact" fill="#64748b" name="Факт" />
          <Bar dataKey="capacity" fill="#94a3b8" name="Ёмкость" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
