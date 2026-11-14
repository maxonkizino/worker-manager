import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { AVATAR_PRESETS, UserAvatar } from "@/entities/employee";
import type { Employee } from "@/shared/api/types";
import { CONFIG } from "@/shared/model/config";
import { getAccessToken } from "@/shared/model/session";
import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";

const VIEW = 280;
const OUTPUT = 512;
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 1_048_576;

type AvatarChooserProps = {
  employee: Employee;
  pending: boolean;
  onClear: () => Promise<void>;
  onPreset: (preset: string | null) => Promise<void>;
  onFile: (file: File, original: File, zoom: number, offsetX: number, offsetY: number) => Promise<void>;
  onReject: (message: string) => void;
};

function clamp(value: number, display: number) {
  const limit = Math.max(0, (display - VIEW) / 2);
  return Math.min(limit, Math.max(-limit, value));
}

async function cropToFile(
  image: HTMLImageElement,
  zoom: number,
  offsetX: number,
  offsetY: number,
): Promise<File> {
  const cover = Math.max(VIEW / image.naturalWidth, VIEW / image.naturalHeight);
  const scale = cover * zoom;
  const displayW = image.naturalWidth * scale;
  const displayH = image.naturalHeight * scale;
  const left = (VIEW - displayW) / 2 + offsetX;
  const top = (VIEW - displayH) / 2 + offsetY;
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT;
  canvas.height = OUTPUT;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Не удалось подготовить фото");
  }
  const ratio = OUTPUT / VIEW;
  context.drawImage(image, left * ratio, top * ratio, displayW * ratio, displayH * ratio);

  for (const quality of [0.92, 0.8, 0.68, 0.55]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= MAX_UPLOAD_BYTES) {
      return new File([blob], "avatar.jpg", { type: "image/jpeg" });
    }
  }
  throw new Error("После кадрирования фото всё ещё больше 1 МБ");
}

export function AvatarChooser({ employee, pending, onClear, onPreset, onFile, onReject }: AvatarChooserProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const previewRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"pick" | "crop">("pick");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [editingExisting, setEditingExisting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function replacePreview(next: string | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = next;
    setPreviewUrl(next);
  }

  const cover = natural ? Math.max(VIEW / natural.w, VIEW / natural.h) : 1;
  const displayW = natural ? natural.w * cover * zoom : VIEW;
  const displayH = natural ? natural.h * cover * zoom : VIEW;

  function closeAll() {
    setOpen(false);
    setStep("pick");
    setNatural(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSourceFile(null);
    setEditingExisting(false);
    setLocalError(null);
    replacePreview(null);
  }

  function openCrop(file: File) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      const message = "Можно загрузить PNG, JPEG или WebP";
      setLocalError(message);
      onReject(message);
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      const message = "Файл больше 15 МБ";
      setLocalError(message);
      onReject(message);
      return;
    }
    setLocalError(null);
    setNatural(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSourceFile(file);
    setEditingExisting(false);
    replacePreview(URL.createObjectURL(file));
    setStep("crop");
  }

  async function editCurrentPhoto() {
    setLocalError(null);
    try {
      const token = await getAccessToken();
      const sourceUrl = employee.avatarSource
        ? `${CONFIG.API_BASE_URL}/employees/me/avatar-source?v=${employee.avatarRevision}`
        : `${CONFIG.API_BASE_URL}/employees/${employee.id}/avatar?v=${employee.avatarRevision}`;
      const response = await fetch(sourceUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Не удалось открыть фото");
      }
      const blob = await response.blob();
      const file = new File([blob], "photo", { type: blob.type || "image/jpeg" });
      setSourceFile(file);
      setEditingExisting(true);
      setZoom(employee.avatarZoom ?? 1);
      setOffset({ x: employee.avatarOffsetX ?? 0, y: employee.avatarOffsetY ?? 0 });
      setNatural(null);
      replacePreview(URL.createObjectURL(blob));
      setStep("crop");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось открыть фото";
      setLocalError(message);
      onReject(message);
    }
  }

  async function choosePreset(preset: string | null) {
    setLocalError(null);
    try {
      await onPreset(preset);
      closeAll();
    } catch {
      // The profile form shows the request error.
    }
  }

  async function removePhoto() {
    setLocalError(null);
    try {
      await onClear();
      closeAll();
    } catch {
      // The profile form shows the request error.
    }
  }

  async function saveCrop() {
    const image = imageRef.current;
    if (!image || !natural) return;
    setLocalError(null);
    try {
      if (!sourceFile) return;
      const file = await cropToFile(image, zoom, offset.x, offset.y);
      await onFile(file, sourceFile, zoom, offset.x, offset.y);
      closeAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось сохранить фото";
      setLocalError(message);
      onReject(message);
    }
  }

  const selectedPreset = employee.customAvatar ? null : employee.avatarPreset;
  const initialsSelected = !employee.customAvatar && !employee.avatarPreset;

  return (
    <>
      <button
        type="button"
        className="group relative size-28 rounded-full"
        aria-label="Изменить аватар"
        disabled={pending}
        onClick={() => {
          setLocalError(null);
          setStep("pick");
          setOpen(true);
        }}
      >
        <UserAvatar
          name={employee.fullName}
          employeeId={employee.id}
          avatarPreset={employee.avatarPreset}
          customAvatar={employee.customAvatar}
          avatarRevision={employee.avatarRevision}
          className="size-28 text-2xl"
        />
        <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-slate-900/60 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="size-6" />
          <span className="text-xs font-medium">Изменить</span>
        </span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) openCrop(file);
        }}
      />

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : closeAll())}>
        <DialogContent className={step === "crop" ? "sm:max-w-md" : "sm:max-w-xl"}>
          {step === "pick" ? (
            <>
              <DialogHeader>
                <DialogTitle>Аватар</DialogTitle>
                <DialogDescription>Выберите портрет из набора или загрузите своё фото.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-4 justify-items-center gap-3 sm:grid-cols-5">
                <button
                  type="button"
                  className="rounded-full ring-offset-2"
                  aria-label="свое фото"
                  onClick={() => fileRef.current?.click()}
                >
                  <span className="flex size-14 flex-col items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 px-1 text-center text-[10px] leading-tight font-medium text-slate-600">
                    свое фото
                  </span>
                </button>
                {employee.hasAvatarPhoto ? (
                  <button
                    type="button"
                    className={`rounded-full ring-offset-2 ${employee.customAvatar ? "ring-2 ring-teal-700" : ""}`}
                    aria-label="Загруженное фото"
                    disabled={pending}
                    onClick={() => void editCurrentPhoto()}
                  >
                    <UserAvatar
                      name={employee.fullName}
                      employeeId={employee.id}
                      customAvatar
                      avatarRevision={employee.avatarRevision}
                      className="size-14"
                    />
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`rounded-full ring-offset-2 ${initialsSelected ? "ring-2 ring-teal-700" : ""}`}
                  aria-label="Заглушка с инициалами"
                  disabled={pending}
                  onClick={() => void choosePreset(null)}
                >
                  <UserAvatar name={employee.fullName} className="size-14 text-sm" />
                </button>
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    aria-label={preset.label}
                    disabled={pending}
                    className={`rounded-full ring-offset-2 ${selectedPreset === preset.id ? "ring-2 ring-teal-700" : ""}`}
                    onClick={() => void choosePreset(preset.id)}
                  >
                    <UserAvatar name={preset.label} avatarPreset={preset.id} className="size-14" />
                  </button>
                ))}
              </div>
              {localError ? <p className="text-sm text-red-600">{localError}</p> : null}
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Своё фото</DialogTitle>
                <DialogDescription>
                  {editingExisting
                    ? "Измените размер и положение или удалите фото."
                    : "Сдвиньте фото и измените размер. В профиль попадёт круг."}
                </DialogDescription>
              </DialogHeader>
              <div
                className="relative mx-auto size-[280px] cursor-grab touch-none overflow-hidden rounded-full bg-slate-200 active:cursor-grabbing"
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  dragRef.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
                }}
                onPointerMove={(event) => {
                  const drag = dragRef.current;
                  if (!drag) return;
                  setOffset({
                    x: clamp(drag.ox + event.clientX - drag.x, displayW),
                    y: clamp(drag.oy + event.clientY - drag.y, displayH),
                  });
                }}
                onPointerUp={() => {
                  dragRef.current = null;
                }}
                onPointerCancel={() => {
                  dragRef.current = null;
                }}
              >
                {previewUrl ? (
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt=""
                    draggable={false}
                    onLoad={(event) =>
                      setNatural({ w: event.currentTarget.naturalWidth, h: event.currentTarget.naturalHeight })
                    }
                    className="absolute max-w-none select-none"
                    style={{
                      width: displayW,
                      height: displayH,
                      left: (VIEW - displayW) / 2 + offset.x,
                      top: (VIEW - displayH) / 2 + offset.y,
                    }}
                  />
                ) : null}
              </div>
              <label className="grid gap-2 text-sm text-slate-700">
                Размер
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  aria-valuetext={`${Math.round(zoom * 100)} процентов`}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setZoom(next);
                    const nextW = natural ? natural.w * cover * next : VIEW;
                    const nextH = natural ? natural.h * cover * next : VIEW;
                    setOffset((current) => ({
                      x: clamp(current.x, nextW),
                      y: clamp(current.y, nextH),
                    }));
                  }}
                />
              </label>
              {localError ? <p className="text-sm text-red-600">{localError}</p> : null}
              <DialogFooter className="sm:justify-between">
                {editingExisting ? (
                  <Button type="button" variant="outline" onClick={() => void removePhoto()} disabled={pending}>
                    Удалить
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep("pick");
                      setNatural(null);
                      setSourceFile(null);
                      setEditingExisting(false);
                      replacePreview(null);
                    }}
                    disabled={pending}
                  >
                    Назад
                  </Button>
                  <Button type="button" onClick={() => void saveCrop()} disabled={pending || !natural || !sourceFile}>
                    Сохранить
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
