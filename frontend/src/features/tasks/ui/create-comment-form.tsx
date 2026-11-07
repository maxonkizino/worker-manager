import { useState, FormEvent } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Textarea } from "@/shared/ui/kit/textarea";
import { Loader2 } from "lucide-react";
import { useCreateComment } from "../model/use-create-comment";
import { Alert, AlertDescription } from "@/shared/ui/kit/alert";

interface CreateCommentFormProps {
  taskId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateCommentForm({ taskId, onSuccess, onCancel }: CreateCommentFormProps) {
  const [content, setContent] = useState("");
  const { createComment, isPending, errorMessage } = useCreateComment(taskId, () => {
    setContent("");
    onSuccess?.();
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }
    createComment({ content: content.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Textarea
          placeholder="Напишите комментарий..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="resize-none"
          disabled={isPending}
        />
      </div>
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Отмена
          </Button>
        )}
        <Button type="submit" disabled={isPending || !content.trim()}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            "Отправить"
          )}
        </Button>
      </div>
    </form>
  );
}

