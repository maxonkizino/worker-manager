import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api";
import type { Project, ProjectMember } from "@/shared/api/types";
import type { ProposalSummary } from "@/shared/api/types";

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: string) => ["projects", id] as const,
  members: (id: string) => ["projects", id, "members"] as const,
  proposals: (projectId: string) => ["proposals", projectId] as const,
};

export function useProjectsList() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => apiRequest<Project[]>("/projects"),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => apiRequest<Project>(`/projects/${id}`),
    enabled: Boolean(id),
  });
}

export function useProjectMembers(id: string) {
  return useQuery({
    queryKey: projectKeys.members(id),
    queryFn: () => apiRequest<ProjectMember[]>(`/projects/${id}/members`),
    enabled: Boolean(id),
  });
}

export function useProjectProposals(projectId: string) {
  return useQuery({
    queryKey: projectKeys.proposals(projectId),
    queryFn: () =>
      apiRequest<ProposalSummary[]>(
        `/optimization/proposals?projectId=${projectId}`,
      ),
    enabled: Boolean(projectId),
  });
}
