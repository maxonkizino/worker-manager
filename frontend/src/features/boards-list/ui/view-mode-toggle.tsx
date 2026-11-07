import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import { LayoutList, LayoutGrid } from "lucide-react";

export type ViewMode = "list" | "grid";
export function ViewModeToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}) {
  return (
    <Tabs defaultValue={value} onValueChange={(e) => onChange(e as ViewMode)}>
      <TabsList>
        <TabsTrigger value="list">
          <LayoutList />
        </TabsTrigger>
        <TabsTrigger value="grid">
          <LayoutGrid />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
