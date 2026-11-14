import { Link } from "react-router-dom";
import { useMyLoad } from "@/entities/employee";
import { useTasksList } from "@/entities/task";
import { useNotificationsInbox } from "@/entities/notification";
import { useSession } from "@/shared/model/session";
import { ROUTES } from "@/shared/model/routes";
import { canEditSettings, canViewOwnLoad, canViewTasks } from "@/shared/lib/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { Button } from "@/shared/ui/kit/button";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function Component() {
  const { session } = useSession();
  const roles = session?.roles;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Дашборд</h1>
        <p className="text-sm text-slate-600">Сводка по доступным разделам</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {canViewTasks(roles) ? <MyTasksCard userId={session?.sub} /> : null}
        {canViewOwnLoad(roles) ? <LoadCard /> : null}
        <NotificationsCard />
        {canEditSettings(roles) ? <AdminCard /> : null}
      </div>
    </div>
  );
}

function MyTasksCard({ userId }: { userId?: string }) {
  const { data: myTasks = [] } = useTasksList();
  const myAssigned = myTasks.filter((task) => task.activeAssigneeId === userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Мои задачи</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-teal-700">{myAssigned.length}</p>
        <Button variant="link" className="px-0" asChild>
          <Link to={ROUTES.TASKS}>Открыть список</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadCard() {
  const today = new Date();
  const from = isoDate(today);
  const to = isoDate(new Date(today.getTime() + 14 * 86_400_000));
  const { data: load } = useMyLoad(from, to);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Загрузка (14 дн.)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-slate-800">
          {load ? `${Number(load.utilization).toFixed(0)}%` : "—"}
        </p>
        <p className="text-xs text-slate-500">
          План: {load?.plannedHours ?? "—"} ч / Ёмкость: {load?.capacityHours ?? "—"} ч
        </p>
      </CardContent>
    </Card>
  );
}

function NotificationsCard() {
  const { data: notifications = [] } = useNotificationsInbox();
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Уведомления</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-slate-800">{unread}</p>
        <Button variant="link" className="px-0" asChild>
          <Link to={ROUTES.NOTIFICATIONS}>Входящие</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AdminCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Администрирование</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start">
        <Button variant="link" className="px-0" asChild>
          <Link to={ROUTES.EMPLOYEES}>Сотрудники</Link>
        </Button>
        <Button variant="link" className="px-0" asChild>
          <Link to={ROUTES.SETTINGS}>Настройки расчёта</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
