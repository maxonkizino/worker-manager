export type AppRole = "ROLE_ADMIN" | "ROLE_MANAGER" | "ROLE_EMPLOYEE";

export function hasRole(roles: string[] | undefined, role: AppRole): boolean {
  return roles?.includes(role) ?? false;
}

function isManager(roles: string[] | undefined): boolean {
  return hasRole(roles, "ROLE_MANAGER");
}

function isEmployee(roles: string[] | undefined): boolean {
  return hasRole(roles, "ROLE_EMPLOYEE");
}

export function canEditSettings(roles: string[] | undefined): boolean {
  return hasRole(roles, "ROLE_ADMIN");
}

export function canViewEmployees(roles: string[] | undefined): boolean {
  return hasRole(roles, "ROLE_ADMIN") || isManager(roles);
}

export function canViewProjects(roles: string[] | undefined): boolean {
  return hasRole(roles, "ROLE_ADMIN") || isManager(roles) || isEmployee(roles);
}

export function canManageProjects(roles: string[] | undefined): boolean {
  return isManager(roles);
}

export function canViewTasks(roles: string[] | undefined): boolean {
  return isManager(roles) || isEmployee(roles);
}

export function canManageTasks(roles: string[] | undefined): boolean {
  return isManager(roles);
}

export function canChangeTaskStatus(roles: string[] | undefined): boolean {
  return isManager(roles) || isEmployee(roles);
}

export function canLogTime(roles: string[] | undefined): boolean {
  return isEmployee(roles);
}

export function canViewAbsences(roles: string[] | undefined): boolean {
  return isManager(roles) || isEmployee(roles);
}

export function canRequestAbsence(roles: string[] | undefined): boolean {
  return isEmployee(roles);
}

export function canManageAbsences(roles: string[] | undefined): boolean {
  return isManager(roles);
}

export function canViewOwnLoad(roles: string[] | undefined): boolean {
  return isManager(roles) || isEmployee(roles);
}

export function canViewTeamLoad(roles: string[] | undefined): boolean {
  return isManager(roles);
}

export function canRunOptimization(roles: string[] | undefined): boolean {
  return isManager(roles);
}
