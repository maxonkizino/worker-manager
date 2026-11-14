import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeKeys } from "@/entities/employee";
import { AvatarChooser } from "./avatar-chooser";
import { ApiError, apiRequest } from "@/shared/api";
import type { Employee } from "@/shared/api/types";
import { CONFIG } from "@/shared/model/config";
import { getAccessToken } from "@/shared/model/session";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";

const CHANNELS = [
  { value: "IN_APP", label: "В приложении" },
  { value: "TELEGRAM", label: "Telegram" },
  { value: "EMAIL", label: "Электронная почта" },
] as const;

async function sendAvatarFile(
  file: File,
  original: File,
  zoom: number,
  offsetX: number,
  offsetY: number,
): Promise<Employee> {
  const token = await getAccessToken();
  const body = new FormData();
  body.append("file", file);
  body.append("original", original);
  body.append("zoom", String(zoom));
  body.append("offsetX", String(offsetX));
  body.append("offsetY", String(offsetY));
  const response = await fetch(`${CONFIG.API_BASE_URL}/employees/me/avatar`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text || "Не удалось загрузить аватар");
  }
  return response.json() as Promise<Employee>;
}

export function ProfileEditor({ employee }: { employee: Employee }) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(employee.fullName);
  const [email, setEmail] = useState(employee.email);
  const [position, setPosition] = useState(employee.position ?? "");
  const [telegram, setTelegram] = useState(
    employee.telegramChatId == null ? "" : String(employee.telegramChatId),
  );
  const [channel, setChannel] = useState(employee.preferredChannel);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(employee.fullName);
    setEmail(employee.email);
    setPosition(employee.position ?? "");
    setTelegram(employee.telegramChatId == null ? "" : String(employee.telegramChatId));
    setChannel(employee.preferredChannel);
  }, [employee]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    await queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) });
  };

  const saveProfile = useMutation({
    mutationFn: () =>
      apiRequest<Employee>("/employees/me", {
        method: "PATCH",
        body: {
          fullName,
          email,
          position: position.trim() || null,
          telegramChatId: telegram.trim() ? Number(telegram) : null,
          preferredChannel: channel,
        },
      }),
    onSuccess: async () => {
      setError(null);
      setMessage("Профиль сохранён");
      await refresh();
    },
    onError: (err: Error) => {
      setMessage(null);
      setError(err.message);
    },
  });

  const changeAvatar = useMutation({
    mutationFn: async (
      action:
        | { kind: "preset"; preset: string | null }
        | { kind: "file"; file: File; original: File; zoom: number; offsetX: number; offsetY: number }
        | { kind: "clear" },
    ) => {
      if (action.kind === "file") {
        return sendAvatarFile(action.file, action.original, action.zoom, action.offsetX, action.offsetY);
      }
      if (action.kind === "clear") {
        return apiRequest<Employee>("/employees/me/avatar", { method: "DELETE" });
      }
      return apiRequest<Employee>("/employees/me/avatar-preset", {
        method: "PUT",
        body: { preset: action.preset },
      });
    },
    onSuccess: async () => {
      setError(null);
      setMessage("Аватар обновлён");
      await refresh();
    },
    onError: (err: Error) => {
      setMessage(null);
      setError(err.message);
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <section className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <AvatarChooser
          employee={employee}
          pending={changeAvatar.isPending}
          onClear={() => changeAvatar.mutateAsync({ kind: "clear" }).then(() => undefined)}
          onPreset={(preset) => changeAvatar.mutateAsync({ kind: "preset", preset }).then(() => undefined)}
          onFile={(file, original, zoom, offsetX, offsetY) =>
            changeAvatar.mutateAsync({ kind: "file", file, original, zoom, offsetX, offsetY }).then(() => undefined)
          }
          onReject={(text) => {
            setMessage(null);
            setError(text);
          }}
        />
        <div>
          <p className="font-semibold text-slate-900">{employee.fullName}</p>
          <p className="text-sm text-slate-600">{employee.position || "Должность не указана"}</p>
        </div>
      </section>

      <div className="space-y-8">
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(null);
            if (telegram.trim() && !/^\d+$/.test(telegram.trim())) {
              setError("Telegram chat id должен быть числом");
              return;
            }
            saveProfile.mutate();
          }}
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">ФИО</Label>
            <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Электронная почта</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Должность</Label>
            <Input id="position" value={position} onChange={(event) => setPosition(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram chat id</Label>
            <Input
              id="telegram"
              inputMode="numeric"
              value={telegram}
              onChange={(event) => setTelegram(event.target.value)}
              placeholder="Необязательно"
            />
          </div>
          <div className="space-y-2">
            <Label>Канал уведомлений</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saveProfile.isPending}>
              Сохранить профиль
            </Button>
          </div>
        </form>

        {message ? <p className="text-sm text-teal-800">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
