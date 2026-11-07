import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Link } from "react-router-dom";
import {CheckSquareIcon, StarIcon, ClockIcon, AlbumIcon, BabyIcon} from "lucide-react";
import { cn } from "@/shared/lib/css";
import { useSession } from "@/shared/model/session";

interface BoardsSidebarProps {
  className?: string;
}

export function BoardsSidebar({ className }: BoardsSidebarProps) {
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
          <Button variant="ghost" className="w-full justify-start hover:bg-yellow-500/10" asChild>
            <Link to={ROUTES.FAVORITE_TASKS}>
              <StarIcon className="mr-2 h-4 w-4 " />
              Избранные задачи
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to={ROUTES.URGENT_TASKS}>
              <ClockIcon className="mr-2 h-4 w-4" />
              Срочные задачи
            </Link>
          </Button>
          {isAdmin && (
              <>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to={ROUTES.ANALYTIC_TASKS}>
                    <AlbumIcon className="mr-2 h-4 w-4" />
                    Аналитика
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to={ROUTES.USER_BOARDS}>
                    <BabyIcon className="mr-2 h-4 w-4" />
                    Пользователи
                  </Link>
                </Button>
              </>
          )}
        </div>
      </div>
  );
}