import { Outlet } from "react-router-dom";
import { AppHeader } from "@/widgets/app-header";
import { AppSidebar } from "@/widgets/app-sidebar";

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
