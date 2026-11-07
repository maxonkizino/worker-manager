import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchClient } from "@/shared/api/instance";
import { useDebouncedValue } from "@/shared/lib/react";
import { RefCallback, useCallback } from "react";
import { components } from "@/shared/api/schema/generated";

type TaskResponse = components["schemas"]["TaskResponse"];
type TaskPageResponse = components["schemas"]["TaskPageResponse"];

interface UseTasksListProps {
  size?: number;
  sort?: string;
  search?: string;
  status?: "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | null;
  department?: "IT" | "HR" | "FINANCE" | "MARKETING" | "SALES" | "CUSTOMER_SERVICE" | "PRODUCTION" | "LOGISTICS" | "RESEARCH_AND_DEVELOPMENT" | "OTHER" | null;
  assigneeId?: string | null;
  creatorId?: string | null;
}

export function useTasksList({
  size = 20,
  sort,
  search: rawSearch,
  status,
  priority,
  department,
  assigneeId,
  creatorId,
}: UseTasksListProps = {}) {
  const normalizedSearch = rawSearch?.trim() ?? "";
  const search = useDebouncedValue(normalizedSearch, 300);
  const searchParam = search ? search : undefined;

  const currentQueryKey = [
    "get",
    "/tasks",
    {
      size,
      sort,
      search: searchParam,
      status: status || undefined,
      priority: priority || undefined,
      department: department || undefined,
      assigneeId: assigneeId || undefined,
      creatorId: creatorId || undefined,
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
      const response = await fetchClient.GET("/tasks", {
        params: {
          query: {
            page: currentPage,
            size,
            sort,
            search: searchParam,
            status: status || undefined,
            priority: priority || undefined,
            department: department || undefined,
            assigneeId: assigneeId || undefined,
            creatorId: creatorId || undefined,
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch tasks");
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
