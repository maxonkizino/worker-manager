import { useNotificationsInbox } from "@/entities/notification";
import { ListPageLayout } from "@/widgets/list-page-layout";
import { Badge } from "@/shared/ui/kit/badge";

export function Component() {
  const { data: items = [], isPending, isError } = useNotificationsInbox();

  return (
    <ListPageLayout
      title="Уведомления"
      description="Входящие события и оповещения"
    >
      {isPending ? <p>Загрузка...</p> : null}
      {isError ? <p className="text-sm text-slate-600">Не удалось загрузить уведомления.</p> : null}
      <ul className="divide-y">
        {items.map((n) => (
          <li key={n.id} className="flex items-start justify-between py-3">
            <div>
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-slate-600">{n.body}</p>
              <p className="text-xs text-slate-400">{n.createdAt}</p>
            </div>
            {!n.read ? <Badge>Новое</Badge> : null}
          </li>
        ))}
        {!isPending && !isError && items.length === 0 ? (
          <li className="py-4 text-slate-500">Входящих уведомлений пока нет.</li>
        ) : null}
      </ul>
    </ListPageLayout>
  );
}
