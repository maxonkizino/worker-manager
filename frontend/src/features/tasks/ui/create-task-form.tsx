import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Textarea } from "@/shared/ui/kit/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select";
import { Label } from "@/shared/ui/kit/label";
import type { components } from "@/shared/api/schema/generated";

type CreateTaskRequest = components["schemas"]["CreateTaskRequest"];
import { TaskPriority, Department } from "../lib/types";
import { FormEvent, useState, useRef } from "react";
import { useCreateTask } from "../model/use-create-task";
import { UsersMultiSelect } from "./users-multi-select";
import { XIcon, PaperclipIcon, UploadIcon } from "lucide-react";
import { cn } from "@/shared/lib/css";

interface CreateTaskFormProps {
  formData: CreateTaskRequest;
  setFormData: (data: CreateTaskRequest) => void;
  onClose: () => void;
}

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
};

const departmentLabels: Record<Department, string> = {
  IT: "IT",
  HR: "HR",
  FINANCE: "Финансы",
  MARKETING: "Маркетинг",
  SALES: "Продажи",
  CUSTOMER_SERVICE: "Служба поддержки",
  PRODUCTION: "Производство",
  LOGISTICS: "Логистика",
  RESEARCH_AND_DEVELOPMENT: "R&D",
  OTHER: "Другое",
};

export function CreateTaskForm({ formData, setFormData, onClose }: CreateTaskFormProps) {
  const { createTask, isPending, errorMessage } = useCreateTask(onClose);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(formData.assigneeIds || [])
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Обновляем assigneeIds из выбранных пользователей
    const taskData = {
      ...formData,
      assigneeIds: Array.from(selectedUserIds),
    };
    
    console.log(" Task form data:", JSON.stringify(taskData, null, 2));
    console.log(" Files:", selectedFiles.map(f => f.name));
    
    createTask(taskData, selectedFiles.length > 0 ? selectedFiles : undefined);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleUserSelectionChange = (userIds: Set<string>) => {
    setSelectedUserIds(userIds);
    setFormData({
      ...formData,
      assigneeIds: Array.from(userIds),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Название задачи *</Label>
        <Input
          id="title"
          placeholder="Название задачи"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          placeholder="Описание задачи"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="priority">Приоритет *</Label>
        <Select
          value={formData.priority}
          onValueChange={(value: TaskPriority) =>
            setFormData({ ...formData, priority: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите приоритет" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(priorityLabels).map(([priority, label]) => (
              <SelectItem key={priority} value={priority}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="department">Отдел *</Label>
        <Select
          value={formData.department}
          onValueChange={(value: Department) =>
            setFormData({ ...formData, department: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите отдел" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(departmentLabels).map(([department, label]) => (
              <SelectItem key={department} value={department}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="dueDate">Срок выполнения</Label>
        <Input
          id="dueDate"
          type="datetime-local"
          value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ""}
          onChange={(e) => setFormData({ 
            ...formData, 
            dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined 
          })}
        />
      </div>

      <div>
        <Label htmlFor="tags">Теги (через запятую)</Label>
        <Input
          id="tags"
          placeholder="urgent, backend, frontend"
          value={formData.tags?.join(", ") || ""}
          onChange={(e) => setFormData({ 
            ...formData, 
            tags: e.target.value ? e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag) : []
          })}
        />
      </div>

      <div>
        <Label htmlFor="assignees">Исполнители</Label>
        <UsersMultiSelect
          selectedUserIds={selectedUserIds}
          onSelectionChange={handleUserSelectionChange}
        />
      </div>

      <div>
        <Label htmlFor="files">Файлы</Label>
        <div className="space-y-2">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDropZoneClick}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
            )}
          >
            <input
              ref={fileInputRef}
              id="files"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <UploadIcon className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm">
                <span className="text-primary font-medium">Нажмите для выбора</span> или перетащите файлы сюда
              </div>
              <p className="text-xs text-muted-foreground">
                Можно выбрать несколько файлов
              </p>
            </div>
          </div>
          {selectedFiles.length > 0 && (
            <div className="space-y-1">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <PaperclipIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="text-destructive text-sm">{errorMessage}</p>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Назад
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Создание...' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}
