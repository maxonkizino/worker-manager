import { useSession } from "@/shared/model/session";
import { Button } from "@/shared/ui/kit/button";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";

export function AppHeader() {
  const { session, logout } = useSession();

  if (!session) {
    return null;
  }

  return (
    <header className="bg-background border-b border-border/40 shadow-sm py-3 px-4 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-xl font-semibold">TaskFlow Orchestrator</div>

        <div className="flex items-center gap-4">
          <span className="text-sm ">
            <Link
              to={ROUTES.USER_PROFILE.replace(":id", session.userId)}
              className="px-2 py-1 rounded transition-colors hover:bg-emerald-500/10 hover:text-foreground"
              style={{ textDecoration: "none" }}
            >
              {session.sub}
            </Link>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            className="hover:bg-destructive/10"
          >
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}
