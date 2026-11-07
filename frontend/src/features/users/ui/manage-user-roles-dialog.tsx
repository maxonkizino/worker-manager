import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/kit/dialog";
import { Button } from "@/shared/ui/kit/button";
import { Loader2, Check, X } from "lucide-react";
import { useAssignRole } from "../model/use-assign-role";
import { useRemoveRole } from "../model/use-remove-role";
import { ApiSchemas } from "@/shared/api/schema";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Label } from "@/shared/ui/kit/label";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface ManageUserRolesDialogProps {
  userId: string;
  username: string;
  currentRoles: ApiSchemas["ProfileResponse"]["roles"];
  isOpen: boolean;
  onClose: () => void;
}

const ALL_ROLES: ApiSchemas["ProfileResponse"]["roles"][number][] = ["ROLE_USER", "ROLE_ADMIN"];

export function ManageUserRolesDialog({
  userId,
  username,
  currentRoles,
  isOpen, 
  onClose,
}: ManageUserRolesDialogProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Initialize useNavigate
  const [selectedRoles, setSelectedRoles] = useState<typeof ALL_ROLES>(currentRoles || []);
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  useEffect(() => {
    setSelectedRoles(currentRoles || []);
  }, [currentRoles]);

  const { mutateAsync: assignRoleMutateAsync } = useAssignRole();
  const { mutateAsync: removeRoleMutateAsync } = useRemoveRole();

  const handleRoleToggle = (role: typeof ALL_ROLES[number]) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSaveRoles = async () => {
    setIsSavingChanges(true);
    const rolesToAssign = selectedRoles.filter((role) => !currentRoles?.includes(role));
    const rolesToRemove = (currentRoles || []).filter((role) => !selectedRoles.includes(role));
    const mutationPromises: Promise<any>[] = [];

    rolesToAssign.forEach((role) => {
      // Assuming 'USER' -> 'ROLE_USER' and 'ADMIN' -> 'ROLE_ADMIN' mapping
      const apiRole = `ROLE_${role}` as ApiSchemas["AssignRoleRequest"]["role"];
      mutationPromises.push(
        assignRoleMutateAsync({ body: { id: userId, username, role: apiRole } })
      );
    });

    rolesToRemove.forEach((role) => {
      const apiRole = `ROLE_${role}` as ApiSchemas["AssignRoleRequest"]["role"];
      mutationPromises.push(
        removeRoleMutateAsync({ body: { id: userId, username, role: apiRole } })
      );
    });

    try {
      await Promise.all(mutationPromises);
      toast.success("Роли пользователя успешно обновлены!");
      await queryClient.invalidateQueries({ queryKey: ["get", '/users/${userId}'] });
      onClose(); // Close dialog first to avoid navigation issues while still open
      navigate('/users'); // Redirect to the user list page
    } catch (error: any) {
      toast.error("Ошибка при обновлении ролей:", { description: error.message });
    } finally {
      setIsSavingChanges(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Управление ролями пользователя {username}</DialogTitle>
          <DialogDescription>Выберите роли для пользователя.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {ALL_ROLES.map((role) => (
            <div key={role} className="flex items-center justify-between">
              <Label htmlFor={role}>{role}</Label>
              <Button
                variant={selectedRoles.includes(role) ? "destructive" : "outline"}
                size="sm"
                onClick={() => handleRoleToggle(role)}
                disabled={isSavingChanges}
              >
                {selectedRoles.includes(role) ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                {selectedRoles.includes(role) ? "Удалить" : "Назначить"}
              </Button>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSavingChanges}>
            Отмена
          </Button>
          <Button onClick={handleSaveRoles} disabled={isSavingChanges}>
            {isSavingChanges ? <Loader2 className="w-4 h-4 animate-spin" /> : "Сохранить изменения"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
