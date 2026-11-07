import { rqClient } from "@/shared/api/instance";
import { keepPreviousData } from "@tanstack/query-core";
import { RefCallback, useCallback } from "react";

type UseBoardsListParams = {
  limit?: number;
  isFavorite?: boolean;
  search?: string;
  sort?: "createdAt" | "updatedAt" | "lastOpenedAt" | "name";
};

export function useBoardsList({
  limit = 20,
  isFavorite,
  search,
  sort,
}: UseBoardsListParams) {
  const { fetchNextPage, data, isFetchingNextPage, isPending, hasNextPage } =
    rqClient.useInfiniteQuery(
      "get",
      "/boards",
      {
        params: {
          query: {
            page: 1,
            limit,
            isFavorite,
            search,
            sort,
          },
        },
      },
      {
        initialPageParam: 1,
        pageParamName: "page",
        getNextPageParam: (lastPage, _, lastPageParams) =>
          Number(lastPageParams) < lastPage.totalPages
            ? Number(lastPageParams) + 1
            : null,

        placeholderData: keepPreviousData,
      },
    );

  const cursorRef: RefCallback<HTMLDivElement> = useCallback(
    (el) => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        { threshold: 0.5 },
      );

      if (el) {
        observer.observe(el);

        return () => {
          observer.disconnect();
        };
      }
    },
    [fetchNextPage],
  );

  const boards = data?.pages.flatMap((page) => page.list) ?? [];

  return {
    boards,
    isFetchingNextPage,
    isPending,
    hasNextPage,
    cursorRef,
  };
}
