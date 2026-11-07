// Re-export types from API schema
export type {
  TaskResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateStatusRequest,
  UpdateAssigneesRequest,
  CommentResponse,
} from "@/shared/api/schema/generated";

// Additional types for our components
export type TaskStatus = "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type Department = 
  | "IT" 
  | "HR" 
  | "FINANCE" 
  | "MARKETING" 
  | "SALES" 
  | "CUSTOMER_SERVICE" 
  | "PRODUCTION" 
  | "LOGISTICS" 
  | "RESEARCH_AND_DEVELOPMENT" 
  | "OTHER";
