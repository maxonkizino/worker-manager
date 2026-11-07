import { useState } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import { Label } from "@/shared/ui/kit/label";
import { useAllUsers } from "../model/use-all-users";
import { cn } from "@/shared/lib/css";
import { ChevronDownIcon, XIcon } from "lucide-react";

interface UsersMultiSelectProps {
  selectedUserIds: Set<string>;
  onSelectionChange: (userIds: Set<string>) => void;
}

export function UsersMultiSelect({ selectedUserIds, onSelectionChange }: UsersMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: users = [], isPending } = useAllUsers();

  const toggleUser = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    onSelectionChange(newSelection);
  };

  const selectedUsers = users.filter((user) => selectedUserIds.has(user.id));
  const displayText = selectedUsers.length > 0 
    ? `${selectedUsers.length} выбрано` 
    : "Выберите исполнителей";

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDownIcon className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md">
            <div className="max-h-60 overflow-auto p-2">
              {isPending ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Загрузка...
                </div>
              ) : users.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Пользователи не найдены
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => {
                    const isSelected = selectedUserIds.has(user.id);
                    return (
                      <label
                        key={user.id}
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleUser(user.id)}
                        />
                        <span className="text-sm flex-1">
                          {user.username || user.email}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedUsers.length > 0 && (
              <div className="border-t p-2">
                <div className="flex flex-wrap gap-1">
                  {selectedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs"
                    >
                      {user.username || user.email}
                      <button
                        type="button"
                        onClick={() => toggleUser(user.id)}
                        className="hover:text-destructive"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

