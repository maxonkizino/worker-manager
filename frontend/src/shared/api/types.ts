export type LoginRequest = { username: string; password: string };

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  fullName: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  username: string;
  roles: string[];
};

export type RegisterResponse = {
  id: string;
  username: string;
  email: string;
};

export type Employee = {
  id: string;
  fullName: string;
  email: string;
  position: string | null;
  departmentId: string | null;
  scheduleId: string;
  usefulTimeFactor: string;
  active: boolean;
  telegramChatId: number | null;
  preferredChannel: string;
  avatarPreset: string | null;
  customAvatar: boolean;
  avatarRevision: number;
  version: number;
  avatarZoom: number | null;
  avatarOffsetX: number | null;
  avatarOffsetY: number | null;
  avatarSource: boolean;
  hasAvatarPhoto: boolean;
};

export type AbsenceType =
  | "VACATION"
  | "SICK_LEAVE"
  | "BUSINESS_TRIP"
  | "STUDY_LEAVE"
  | "OTHER";

export type AbsenceStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Absence = {
  id: string;
  employeeId: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  status: AbsenceStatus;
  comment: string | null;
  decidedBy: string | null;
  decidedAt: string | null;
  decisionComment: string | null;
  version: number;
};

export type AbsenceRequest = {
  employeeId: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  comment?: string;
};

export type Skill = {
  id: string;
  name: string;
  description: string | null;
};

export type Settings = {
  usefulTimeFactor: string;
  overloadThreshold: string;
  underloadThreshold: string;
  alpha: string;
  beta: string;
  gamma: string;
  delta: string;
  horizonDays: number;
  updatedAt: string;
  updatedBy: string;
  version: number;
};

export type ProjectStatus = "ACTIVE" | "ARCHIVED";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  managerId: string;
  startDate: string;
  endDate: string | null;
  status: ProjectStatus;
  dataVersion: number;
};

export type ProjectMember = {
  employeeId: string;
  projectRole: string;
};

export type TaskStatus =
  | "CREATED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  createdBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  plannedStart: string | null;
  plannedEnd: string | null;
  estimatedHours: string;
  actualHours: string;
  activeAssigneeId: string | null;
  warnings: string[];
};

export type TaskComment = {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export type EmployeeLoad = {
  employeeId: string;
  plannedHours: string;
  actualHours: string;
  capacityHours: string;
  utilization: string;
};

export type TeamLoadResponse = {
  from: string;
  to: string;
  members: EmployeeLoad[];
};

export type PersonalLoad = {
  employeeId: string;
  from: string;
  to: string;
  plannedHours: string;
  actualHours: string;
  capacityHours: string;
  utilization: string;
};

export type ProposalStatus = "NEW" | "APPLIED" | "REJECTED" | "OUTDATED";

export type ProposalSummary = {
  id: string;
  projectId: string;
  status: ProposalStatus;
  requestedAt: string;
  assignedCount: number;
  unassignedCount: number;
  objectiveScore: string;
  warnings: string[];
  explanation: string;
};

export type ProposalDetail = {
  id: string;
  projectId: string;
  status: ProposalStatus;
  requestedAt: string;
  appliedAt: string | null;
  rejectedAt: string | null;
  requestedBy: string;
  warnings: string[];
  variants: {
    id: string;
    kind: string;
    selected: boolean;
    objectiveScore: string;
    assignments: {
      taskId: string;
      employeeId: string;
      plannedHours: string;
      reasonCode: string;
      explanation: string;
    }[];
    unassigned: {
      taskId: string;
      reasonCode: string;
      explanation: string;
    }[];
  }[];
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};
