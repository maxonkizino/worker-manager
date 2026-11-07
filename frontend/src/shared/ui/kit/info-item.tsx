import { ReactNode } from "react";

interface InfoItemProps {
  label: string;
  value: string | ReactNode;
  className?: string;
}

export function InfoItem({ label, value, className = "" }: InfoItemProps) {
  return (
    <div className={`space-x-2 py-2 ${className}`}>
      <div className="flex-1 min-w-0">
        <div className="text-md font-medium text-gray-900 mb-1">{label}</div>
        <div className="text-lg text-gray-700">{value}</div>
      </div>
    </div>
  );
}