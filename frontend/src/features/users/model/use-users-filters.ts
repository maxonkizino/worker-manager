import { useState } from "react";

export function useUsersFilters() {
    const [sort, setSort] = useState("createdAt-desc");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    return { sort, setSort, search, setSearch, status, setStatus, role, setRole };
}