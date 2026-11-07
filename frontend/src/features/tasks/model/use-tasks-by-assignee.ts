import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchClient } from "@/shared/api/instance";
import { RefCallback, useCallback } from "react";
import { components } from "@/shared/api/schema/generated";

type TaskResponse = components["schemas"]["TaskResponse"];
type TaskPageResponse = components["schemas"]["TaskPageResponse"];

interface UseTasksByAssigneeProps {
  userId: string;
  size?: number;
  status?: "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | null;
  creatorId?: string | null;
  department?: "IT" | "HR" | "FINANCE" | "MARKETING" | "SALES" | "CUSTOMER_SERVICE" | "PRODUCTION" | "LOGISTICS" | "RESEARCH_AND_DEVELOPMENT" | "OTHER" | null;
}

export function useTasksByAssignee({
  userId,
  size = 20,
  status,
  creatorId,
  department,
}: UseTasksByAssigneeProps) {
  const currentQueryKey = [
    "get",
    "/tasks/assignee/{userId}",
    {
      userId,
      size,
      status: status || undefined,
      creatorId: creatorId || undefined,
      department: department || undefined,
    },
  ];

  const {
    fetchNextPage,
    data,
    isFetchingNextPage,
    isPending,
    hasNextPage
  } = useInfiniteQuery({
    queryKey: currentQueryKey,
    queryFn: async ({ pageParam }) => {
      const currentPage = (pageParam ?? 0) as number;
      const response = await fetchClient.GET("/tasks/assignee/{userId}", {
        params: {
          path: {
            userId,
          },
          query: {
            page: currentPage,
            size,
            status: status || undefined,
            creatorId: creatorId || undefined,
            department: department || undefined,
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch tasks by assignee");
      }
      return response.data as TaskPageResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const currentPage = (lastPageParam ?? 0) as number;
      return currentPage < lastPage.totalPages - 1
        ? currentPage + 1
        : null;
    },
    placeholderData: keepPreviousData,
    enabled: !!userId, // Only fetch if userId is provided
  });

  const cursorRef: RefCallback<HTMLDivElement> = useCallback(
    (el) => {
      if (!el || !hasNextPage) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.5 },
      );

      observer.observe(el);

      return () => {
        observer.disconnect();
      };
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  const tasks: TaskResponse[] = data?.pages.flatMap((page) => page.content) ?? [];

  return {
    tasks,
    isFetchingNextPage,
    isPending,
    hasNextPage,
    cursorRef,
  };
}

