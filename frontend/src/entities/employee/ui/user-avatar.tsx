import { CONFIG } from "@/shared/model/config";
import { cn } from "@/shared/lib/css";
import { presetAvatarSrc } from "../model/avatar-presets";

type UserAvatarProps = {
  name: string;
  employeeId?: string | null;
  avatarPreset?: string | null;
  customAvatar?: boolean;
  avatarRevision?: number;
  className?: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserAvatar({
  name,
  employeeId,
  avatarPreset,
  customAvatar,
  avatarRevision = 0,
  className,
}: UserAvatarProps) {
  const preset = presetAvatarSrc(avatarPreset);
  const src =
    customAvatar && employeeId
      ? `${CONFIG.API_BASE_URL}/employees/${employeeId}/avatar?v=${avatarRevision}`
      : preset;

  if (!src) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600",
          className,
        )}
        aria-hidden
      >
        {initials(name)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  );
}
