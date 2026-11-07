import { Input } from "@/shared/ui/kit/input";

interface BoardsSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function BoardsSearchInput({ value, onChange }: BoardsSearchInputProps) {
  return (
    <Input
      id="search"
      placeholder="Введите название доски..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
}
