import { useState } from "react";

export type BoardsSortOption =
  | "createdAt"
  | "updatedAt"
  | "lastOpenedAt"
  | "name";

export type BoardsFilters = {
  search: string;
  sort: BoardsSortOption;
};

export function useBoardsFilters() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<BoardsSortOption>("lastOpenedAt");

  return {
    search,
    sort,
    setSearch,
    setSort,
  };
}
