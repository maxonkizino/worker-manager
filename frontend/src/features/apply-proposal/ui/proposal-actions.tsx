import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api";
import type { ProposalDetail } from "@/shared/api/types";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { useState } from "react";

export function useProposalDetail(proposalId: string | undefined) {
  return useQuery({
    queryKey: ["proposal", proposalId],
    queryFn: () =>
      apiRequest<ProposalDetail>(`/optimization/proposals/${proposalId}`),
    enabled: Boolean(proposalId),
  });
}

export function ProposalActions({ proposalId }: { proposalId: string }) {
  const [rejectComment, setRejectComment] = useState("");
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: () =>
      apiRequest<ProposalDetail>(`/optimization/proposals/${proposalId}/apply`, {
        method: "POST",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
      await queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      apiRequest<ProposalDetail>(`/optimization/proposals/${proposalId}/reject`, {
        method: "POST",
        body: { comment: rejectComment || "Отклонено" },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
      await queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={() => applyMutation.mutate()}
        disabled={applyMutation.isPending}
      >
        Применить
      </Button>
      <Input
        className="max-w-xs"
        placeholder="Комментарий при отклонении"
        value={rejectComment}
        onChange={(e) => setRejectComment(e.target.value)}
      />
      <Button
        variant="outline"
        onClick={() => rejectMutation.mutate()}
        disabled={rejectMutation.isPending}
      >
        Отклонить
      </Button>
    </div>
  );
}
