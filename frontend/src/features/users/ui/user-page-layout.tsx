import React from "react";

export function UserPageLayout({
  header,
  children,
  sidebar,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {sidebar}
      <div className="flex-1 flex flex-col">
        {header && <div className="p-6 border-b">{header}</div>}
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

export function UserPageLayoutHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-gray-500">{description}</p>}
      </div>

      <div className="flex gap-2">{actions}</div>
    </div>
  );
}

export function UserPageLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
