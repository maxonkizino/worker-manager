import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Link } from "react-router-dom";
import {LayoutGridIcon, StarIcon, ClockIcon, AlbumIcon, BabyIcon, CheckSquareIcon} from "lucide-react";
import { cn } from "@/shared/lib/css";
import { useSession } from "@/shared/model/session";

interface TasksSidebarProps {
  className?: string;
}

export function TasksSidebar({ className }: TasksSidebarProps) {
  const { session } = useSession();
  const isAdmin = session?.roles.includes("ROLE_ADMIN");

  return (
    <div className={cn("w-64 border-r p-4 space-y-4", className)}>
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-500 px-2">Навигация</div>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to={ROUTES.TASKS}>
            <CheckSquareIcon className="mr-2 h-4 w-4" />
            Все задачи
          </Link>
        </Button>
        {isAdmin && (
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to={ROUTES.USER_BOARDS}>
              <BabyIcon className="mr-2 h-4 w-4" />
              Пользователи
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

