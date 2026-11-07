import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchClient } from "@/shared/api/instance.ts";
import { useDebouncedValue } from "@/shared/lib/react.ts";
import { RefCallback, useCallback } from "react";

interface UseUsersListProps {
  size?: number;
  sort?: string;
  username?: string;
  role?: "ROLE_USER" | "ROLE_ADMIN" | null;
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | null;
}

export function useUsersList({
  size = 20,
  sort,
  username: rawUsername,
  role,
  status,
}: UseUsersListProps) {
  const username = useDebouncedValue(rawUsername, 300);

  const currentQueryKey = [
    "get",
    "/users",
    {
      size,
      sort,
      username,
      role: role || undefined,
      status: status || undefined,
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
      const response = await fetchClient.GET("/users", {
        params: {
          query: {
            page: currentPage,
            size,
            sort,
            username,
            role: role || undefined,
            status: status || undefined,
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch users");
      }
      return response.data;
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

  const users = data?.pages.flatMap((page) => page.content) ?? [];

  return {
    users,
    isFetchingNextPage,
    isPending,
    hasNextPage,
    cursorRef,
  };
}