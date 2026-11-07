import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchClient } from "@/shared/api/instance";
import { useCallback, RefCallback } from "react";
import type { components } from "@/shared/api/schema/generated";
import type { TaskStatus } from "../lib/types";

type TaskResponse = components["schemas"]["TaskResponse"];
type TaskPageResponse = components["schemas"]["TaskPageResponse"];

interface UseUrgentTasksListProps {
  hours?: number;
  size?: number;
  status?: TaskStatus | null;
  assigneeId?: string | null;
}

export function useUrgentTasksList({
  hours = 24,
  size = 20,
  status,
  assigneeId,
}: UseUrgentTasksListProps = {}) {
  const normalizedHours = Math.min(Math.max(1, Math.round(hours)), 168);

  const currentQueryKey = [
    "get",
    "/tasks/due-soon",
    {
      hours: normalizedHours,
      size,
      status: status || undefined,
      assigneeId: assigneeId || undefined,
    },
  ];

  const {
    fetchNextPage,
    data,
    isFetchingNextPage,
    isPending,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: currentQueryKey,
    queryFn: async ({ pageParam }) => {
      const currentPage = (pageParam ?? 0) as number;
      const response = await fetchClient.GET("/tasks/due-soon", {
        params: {
          query: {
            hours: normalizedHours,
            page: currentPage,
            size,
            status: status || undefined,
            assigneeId: assigneeId || undefined,
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch urgent tasks");
      }

      return response.data as TaskPageResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const currentPage = (lastPageParam ?? 0) as number;
      return currentPage < lastPage.totalPages - 1 ? currentPage + 1 : null;
    },
    placeholderData: keepPreviousData,
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


