import { Button } from "@/shared/ui/kit/button.tsx";
import { Input } from "@/shared/ui/kit/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select.tsx";
import { components } from "@/shared/api/schema/generated.ts";
import { FormEvent } from "react";
import { useCreateUser } from "@/features/users/model/use-create-user.tsx";

interface CreateUserFormProps {
  formData: components["schemas"]["CreateUserRequest"];
  setFormData: (data: components["schemas"]["CreateUserRequest"]) => void;
  onClose: () => void;
}

export function CreateUserForm({ formData, setFormData, onClose }: CreateUserFormProps) {
  const { createUser, isPending, errorMessage } = useCreateUser(onClose);

  const handleSubmit = (e: FormEvent) => {
    console.log("📝 Form data:", JSON.stringify(formData, null, 2));
    e.preventDefault();
    createUser(formData);
  };

  return (
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          <Select
              value={formData.roles?.[0] || ""}
              onValueChange={(value: "ROLE_USER" | "ROLE_ADMIN") =>
                  setFormData({
                    ...formData,
                    roles: value === "ROLE_ADMIN" ? ["ROLE_ADMIN", "ROLE_USER"] : [value],
                  })
              }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ROLE_USER">User</SelectItem>
              <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ✅ ДОБАВЬ ОТОБРАЖЕНИЕ ОШИБОК */}
        {errorMessage && (
            <p className="text-destructive text-sm mt-4">{errorMessage}</p>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Назад
          </Button>
          {/* ✅ ИСПОЛЬЗУЙ isPending ИЗ ТВОЕГО ХУКА */}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Создание...' : 'Создать'}
          </Button>
        </div>
      </form>
  );
}