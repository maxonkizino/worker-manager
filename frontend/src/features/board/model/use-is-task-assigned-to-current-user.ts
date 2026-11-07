import { useSession } from "@/shared/model/session";
import { components } from "@/shared/api/schema/generated";

interface UseIsTaskAssignedToCurrentUserOptions {
  task?: components["schemas"]["TaskResponse"];
}

export function useIsTaskAssignedToCurrentUser({
  task,
}: UseIsTaskAssignedToCurrentUserOptions) {
  const { session } = useSession();
  const isSubscribed = task?.assigneeIds?.includes(session?.userId || "") || false;
  return isSubscribed;
}
