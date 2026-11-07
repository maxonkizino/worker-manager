import { useMemo, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import {
  AnalyticListLayout,
  AnalyticListLayoutHeader,
} from "./analyticListLayout";
import { BoardsSidebar } from "@/features/boards-list";
import { rqClient } from "@/shared/api/instance";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/kit/card";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/kit/alert";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Calendar, Loader2, RefreshCw } from "lucide-react";
// Типы респонсов описаны в OpenAPI и доступны через rqClient, явные алиасы здесь не потребовались.

type DateRange = {
  start: Date;
  end: Date;
};

const numberFormatter = new Intl.NumberFormat("ru-RU");
const percentFormatter = new Intl.NumberFormat("ru-RU", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const shortDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
});
const longDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const STATUS_COLORS = ["#6366F1", "#F97316", "#10B981", "#EF4444", "#0EA5E9"];
const PIE_COLORS = ["#34D399", "#FCD34D", "#F472B6", "#38BDF8", "#A855F7"];
const ROLE_COLORS = ["#0EA5E9", "#14B8A6", "#F59E0B", "#EF4444", "#6366F1"];

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Доступные",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершены",
  BLOCKED: "Заблокированы",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
};

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "Администраторы",
  ROLE_USER: "Пользователи",
  ROLE_MANAGER: "Менеджеры",
};

const PRESET_OPTIONS = [
  { label: "7 дней", value: 7 },
  { label: "30 дней", value: 30 },
  { label: "90 дней", value: 90 },
];

const createPresetRange = (days: number): DateRange => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

const toInputValue = (date: Date) => date.toISOString().slice(0, 10);

const normalizeRecord = (
  record?: Record<string, number | null | undefined>,
  dictionary?: Record<string, string>,
) =>
  Object.entries(record ?? {}).map(([name, value]) => ({
    name: dictionary?.[name] ?? name,
    value: typeof value === "number" ? value : Number(value ?? 0),
  }));

const mergeDailySeries = (
  primary?: Record<string, number | null | undefined>,
  secondary?: Record<string, number | null | undefined>,
) => {
  const keys = new Set<string>([
    ...Object.keys(primary ?? {}),
    ...Object.keys(secondary ?? {}),
  ]);

  return Array.from(keys)
    .sort()
    .map((dateKey) => ({
      dateKey,
      date: shortDateFormatter.format(new Date(dateKey)),
      primary: Number(primary?.[dateKey] ?? 0),
      secondary: Number(secondary?.[dateKey] ?? 0),
    }));
};

function BoardsListPage() {
  const [range, setRange] = useState<DateRange>(() => createPresetRange(30));
  const [selectedPreset, setSelectedPreset] = useState<number | null>(30);

  const queryRange = useMemo(
    () => ({
      startDate: range.start.toISOString(),
      endDate: range.end.toISOString(),
    }),
    [range],
  );

  const {
    data: dashboard,
    isLoading,
    isFetching,
    error,
    refetch,
  } = rqClient.useQuery(
    "get",
    "/analytics/dashboard",
    {
      params: {
        query: queryRange,
      },
    },
    {
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
    },
  );

  const taskAnalytics = dashboard?.taskAnalytics;
  const userAnalytics = dashboard?.userAnalytics;
  const loginAnalytics = dashboard?.loginAnalytics;

  const completionRate = useMemo(() => {
    if (!taskAnalytics?.totalTasks || taskAnalytics.totalTasks === 0) {
      return 0;
    }
    return (taskAnalytics.completedTasks ?? 0) / taskAnalytics.totalTasks;
  }, [taskAnalytics]);

  const taskTrendData = useMemo(
    () =>
      mergeDailySeries(
        taskAnalytics?.dailyCreatedTasks ?? {},
        taskAnalytics?.dailyCompletedTasks ?? {},
      ).map((point) => ({
        ...point,
        created: point.primary,
        completed: point.secondary,
      })),
    [taskAnalytics],
  );

  const loginTrendData = useMemo(
    () =>
      mergeDailySeries(
        loginAnalytics?.dailySuccessfulLogins ?? {},
        loginAnalytics?.dailyFailedLogins ?? {},
      ).map((point) => ({
        ...point,
        success: point.primary,
        failed: point.secondary,
      })),
    [loginAnalytics],
  );

  const tasksByStatusData = useMemo(
    () => normalizeRecord(taskAnalytics?.tasksByStatus, STATUS_LABELS),
    [taskAnalytics],
  );

  const tasksByPriorityData = useMemo(
    () => normalizeRecord(taskAnalytics?.tasksByPriority, PRIORITY_LABELS),
    [taskAnalytics],
  );

  const usersByDepartmentData = useMemo(
    () => normalizeRecord(userAnalytics?.usersByDepartment),
    [userAnalytics],
  );

  const usersByRoleData = useMemo(
    () => normalizeRecord(userAnalytics?.usersByRole, ROLE_LABELS),
    [userAnalytics],
  );

  const failureReasons = useMemo(
    () =>
      Object.entries(loginAnalytics?.failureReasons ?? {})
        .map(([reason, value]) => ({
          reason,
          value: Number(value ?? 0),
        }))
        .sort((a, b) => b.value - a.value),
    [loginAnalytics],
  );

  const handlePresetChange = (days: number) => {
    setSelectedPreset(days);
    setRange(createPresetRange(days));
  };

  const handleDateChange = (field: keyof DateRange, value: string) => {
    if (!value) return;
    const next = new Date(`${value}T00:00:00`);
    if (field === "start") {
      next.setHours(0, 0, 0, 0);
    } else {
      next.setHours(23, 59, 59, 999);
    }
    setSelectedPreset(null);
    setRange((prev) => {
      const updated: DateRange = { ...prev, [field]: next };
      if (updated.start > updated.end) {
        if (field === "start") {
          updated.end = new Date(next);
          updated.end.setHours(23, 59, 59, 999);
        } else {
          updated.start = new Date(next);
          updated.start.setHours(0, 0, 0, 0);
        }
      }
      return updated;
    });
  };

  const periodSummary = dashboard
    ? `${longDateFormatter.format(new Date(dashboard.periodStart))} — ${longDateFormatter.format(new Date(dashboard.periodEnd))}`
    : `${longDateFormatter.format(range.start)} — ${longDateFormatter.format(range.end)}`;

  const lastUpdated = dashboard
    ? dateTimeFormatter.format(new Date(dashboard.periodEnd))
    : undefined;

  const renderContent = () => {
    if (isLoading) {
      return <AnalyticsSkeleton />;
    }

    if (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось загрузить аналитические данные.";
      return (
        <Alert variant="destructive">
          <AlertTitle>Ошибка загрузки</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      );
    }

    if (!dashboard) {
      return (
        <Alert>
          <AlertTitle>Данные отсутствуют</AlertTitle>
          <AlertDescription>
            Попробуйте выбрать другой период или обновить страницу.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Всего задач"
            value={numberFormatter.format(taskAnalytics?.totalTasks ?? 0)}
            description={`Создано: ${numberFormatter.format(taskAnalytics?.createdTasks ?? 0)} • Завершено: ${numberFormatter.format(taskAnalytics?.completedTasks ?? 0)}`}
          />
          <SummaryCard
            title="Среднее время выполнения"
            value={
              taskAnalytics?.averageCompletionTimeHours
                ? `${taskAnalytics.averageCompletionTimeHours.toFixed(1)} ч`
                : "—"
            }
            description="По завершённым задачам"
          />
          <SummaryCard
            title="Пользователи"
            value={numberFormatter.format(userAnalytics?.totalUsers ?? 0)}
            description={`Новых: ${numberFormatter.format(userAnalytics?.registeredUsers ?? 0)} • Обновили профиль: ${numberFormatter.format(userAnalytics?.updatedUsers ?? 0)}`}
          />
          <SummaryCard
            title="Активность логинов"
            value={numberFormatter.format(loginAnalytics?.totalLogins ?? 0)}
            description={`Успех: ${percentFormatter.format(loginAnalytics?.successRate ?? 0)}`}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Период отчёта</CardTitle>
                <CardDescription>Фактические даты из бэкенда</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{periodSummary}</p>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground">
                  Обновлено: {lastUpdated}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Выбранный период:{" "}
                {`${longDateFormatter.format(range.start)} — ${longDateFormatter.format(range.end)}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Процент выполнения задач</CardTitle>
              <CardDescription>
                Отношение завершённых задач к общему объёму
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold">
                {percentFormatter.format(completionRate)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Завершено {numberFormatter.format(taskAnalytics?.completedTasks ?? 0)} из{" "}
                {numberFormatter.format(taskAnalytics?.totalTasks ?? 0)} задач.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 2xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Дневная динамика задач</CardTitle>
              <CardDescription>Создано vs завершено</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {taskTrendData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={taskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickMargin={10} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="created"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={false}
                      name="Создано"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      name="Завершено"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartPlaceholder />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Дневная активность входов</CardTitle>
              <CardDescription>Успешные и неуспешные авторизации</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {loginTrendData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={loginTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickMargin={10} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="success"
                      stroke="#0EA5E9"
                      strokeWidth={2}
                      dot={false}
                      name="Успешно"
                    />
                    <Line
                      type="monotone"
                      dataKey="failed"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={false}
                      name="Ошибки"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartPlaceholder />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Распределение задач по статусам</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {tasksByStatusData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tasksByStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Количество">
                      {tasksByStatusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartPlaceholder />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Приоритеты задач</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {tasksByPriorityData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tasksByPriorityData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="50%"
                      outerRadius="80%"
                      paddingAngle={2}
                    >
                      {tasksByPriorityData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartPlaceholder />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Пользователи по департаментам</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {usersByDepartmentData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usersByDepartmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Пользователи" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartPlaceholder />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Распределение ролей</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {usersByRoleData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usersByRoleData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="50%"
                    >
                      {usersByRoleData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartPlaceholder />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Причины неудачных авторизаций</CardTitle>
            <CardDescription>
              Помогает отследить проблемы безопасности и UX
            </CardDescription>
          </CardHeader>
          <CardContent>
            {failureReasons.length ? (
              <ul className="space-y-3">
                {failureReasons.map((item) => (
                  <li
                    key={item.reason}
                    className="flex items-center justify-between rounded-lg border px-4 py-2"
                  >
                    <span className="font-medium">{item.reason}</span>
                    <span className="text-muted-foreground">
                      {numberFormatter.format(item.value)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ошибок входа не зафиксировано за выбранный период.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AnalyticListLayout
      sidebar={<BoardsSidebar />}
      header={
        <AnalyticListLayoutHeader
          title="Аналитика"
          description="Сводные метрики по задачам, пользователям и авторизациям"
          actions={
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Обновление...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Обновить
                </>
              )}
            </Button>
          }
        />
      }
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Фильтры периода</CardTitle>
            <CardDescription>
              Настройте период и пресеты, чтобы пересчитать метрики
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Начало периода</label>
                <Input
                  type="date"
                  value={toInputValue(range.start)}
                  max={toInputValue(range.end)}
                  onChange={(event) =>
                    handleDateChange("start", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Конец периода</label>
                <Input
                  type="date"
                  value={toInputValue(range.end)}
                  min={toInputValue(range.start)}
                  onChange={(event) =>
                    handleDateChange("end", event.target.value)
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_OPTIONS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={
                    preset.value === selectedPreset ? "default" : "outline"
                  }
                  onClick={() => handlePresetChange(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
              <Button
                variant="secondary"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
                Пересчитать
              </Button>
            </div>
          </CardContent>
        </Card>

        {renderContent()}
      </div>
    </AnalyticListLayout>
  );
}

const SummaryCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description?: string;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-semibold">{value}</div>
    </CardContent>
  </Card>
);

const EmptyChartPlaceholder = () => (
  <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
    <p className="text-sm text-muted-foreground">Недостаточно данных</p>
  </div>
);

const AnalyticsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-24 w-full" />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <Skeleton key={index} className="h-32 w-full" />
      ))}
    </div>
    <Skeleton className="h-52 w-full" />
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  </div>
);

export const Component = BoardsListPage;