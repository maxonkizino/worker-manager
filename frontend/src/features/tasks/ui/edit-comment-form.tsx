import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Textarea } from "@/shared/ui/kit/textarea";
import { Loader2 } from "lucide-react";
import { useUpdateComment } from "../model/use-update-comment";
import { Alert, AlertDescription } from "@/shared/ui/kit/alert";
import type { components } from "@/shared/api/schema/generated";

type CommentResponse = components["schemas"]["CommentResponse"];

interface EditCommentFormProps {
  taskId: string;
  comment: CommentResponse;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditCommentForm({ taskId, comment, onSuccess, onCancel }: EditCommentFormProps) {
  const [content, setContent] = useState(comment.content || "");
  const { updateComment, isPending, errorMessage } = useUpdateComment(taskId, comment.id || "", () => {
    onSuccess?.();
  });

  useEffect(() => {
    setContent(comment.content || "");
  }, [comment.content]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }
    updateComment({ content: content.trim() });
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
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </div>
    </form>
  );
}

