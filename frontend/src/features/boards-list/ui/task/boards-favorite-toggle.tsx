import { cn } from "@/shared/lib/css";
import { StarIcon } from "lucide-react";

interface BoardsFavoriteToggleProps {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
}

export function BoardsFavoriteToggle({
  isFavorite,
  onToggle,
  className,
}: BoardsFavoriteToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300",
        "hover:bg-yellow-400/10", // This will override the default hover for outline button
        className,
      )}
    >
      <StarIcon
        className={cn(
          "w-5 h-5",
          isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400",
        )}
      />
      <span className="text-sm text-gray-700">
        {isFavorite ? "Отписаться" : "Подписаться"}
      </span>
    </button>
  );
}
