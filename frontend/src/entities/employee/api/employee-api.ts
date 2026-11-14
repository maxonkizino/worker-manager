import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api";
import type {
  Absence,
  Employee,
  PersonalLoad,
  Settings,
  Skill,
  TeamLoadResponse,
} from "@/shared/api/types";

export const employeeKeys = {
  all: ["employees"] as const,
  detail: (id: string) => ["employees", id] as const,
  skills: ["skills"] as const,
  absences: ["absences"] as const,
  settings: ["settings"] as const,
};

export function useEmployeesList() {
  return useQuery({
    queryKey: employeeKeys.all,
    queryFn: () => apiRequest<Employee[]>("/employees"),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => apiRequest<Employee>(`/employees/${id}`),
    enabled: Boolean(id),
  });
}

export function useSkillsList() {
  return useQuery({
    queryKey: employeeKeys.skills,
    queryFn: () => apiRequest<Skill[]>("/skills"),
  });
}

export function useAbsencesList() {
  return useQuery({
    queryKey: employeeKeys.absences,
    queryFn: () => apiRequest<Absence[]>("/absences"),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: employeeKeys.settings,
    queryFn: () => apiRequest<Settings>("/settings"),
  });
}

export function useTeamLoad(from: string, to: string, projectId?: string) {
  const params = new URLSearchParams({ from, to });
  if (projectId) params.set("projectId", projectId);
  return useQuery({
    queryKey: ["load", "team", from, to, projectId] as const,
    queryFn: () =>
      apiRequest<TeamLoadResponse>(`/load/team?${params.toString()}`),
  });
}

export function useMyLoad(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  return useQuery({
    queryKey: ["load", "me", from, to] as const,
    queryFn: () => apiRequest<PersonalLoad>(`/load/me?${params.toString()}`),
  });
}
