import type { ReactNode } from "react";

export function ListPageLayout({
  title,
  description,
  actions,
  filters,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description ? (
            <p className="text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </div>
      {filters ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          {filters}
        </div>
      ) : null}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {children}
      </div>
    </div>
  );
}
