import { http, HttpResponse } from "msw";
import { delay } from "msw";
import { UserResponse, CreateUserRequest, UpdateUserRequest } from "@/shared/api/types";

const mockUsers: UserResponse[] = [
    {
        id: "550e8400-e29b-41d4-a716-446655440001",
        username: "admin_user",
        email: "admin@company.com",
        firstName: "Admin",
        lastName: "User",
        phone: "+1234567890",
        roles: ["ADMIN"],
        status: "ACTIVE",
        createdAt: "2025-01-01T10:00:00Z",
        updatedAt: "2025-01-02T12:00:00Z",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440002",
        username: "regular_user",
        email: "user@company.com",
        firstName: "John",
        lastName: "Doe",
        phone: "+0987654321",
        roles: ["USER"],
        status: "ACTIVE",
        createdAt: "2025-02-01T10:00:00Z",
        updatedAt: "2025-02-02T12:00:00Z",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440003",
        username: "pending_user",
        email: "pending@company.com",
        firstName: "Jane",
        lastName: "Smith",
        phone: "+1122334455",
        roles: ["USER"],
        status: "PENDING",
        createdAt: "2025-03-01T10:00:00Z",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440004",
        username: "inactive_user",
        email: "inactive@company.com",
        firstName: "Alice",
        lastName: "Johnson",
        phone: "+5566778899",
        roles: ["USER"],
        status: "INACTIVE",
        createdAt: "2025-04-01T10:00:00Z",
        updatedAt: "2025-04-02T12:00:00Z",
    },
];

const userPasswords = new Map<string, string>();
mockUsers.forEach((user) => {
    userPasswords.set(user.email, "defaultPassword123");
});

export const userHandlers = [
    // Получение текущего пользователя
    http.get("/api/users/me", async ({ request }) => {
        await delay();

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { message: "Требуется авторизация", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        // Для тестов возвращаем первого пользователя (admin_user)
        const user = mockUsers[0];
        return HttpResponse.json(user, { status: 200 });
    }),

    // Получение списка пользователей с фильтрацией, сортировкой и пагинацией
    http.get("/api/users", async ({ request }) => {
        await delay();

        const url = new URL(request.url);
        const sort = url.searchParams.get("sort") || "createdAt-desc";
        const search = url.searchParams.get("search") || "";
        const status = url.searchParams.get("status");
        const cursor = url.searchParams.get("cursor");

        // Проверка авторизации
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { message: "Требуется авторизация", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        // Фильтрация и поиск
        let filteredUsers = mockUsers.filter((user) => {
            const matchesSearch =
                user.username.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = status ? user.status === status : true;
            return matchesSearch && matchesStatus;
        });

        // Сортировка
        filteredUsers = filteredUsers.sort((a, b) => {
            const [field, direction] = sort.split("-");
            const isDesc = direction === "desc";
            if (field === "username") {
                return isDesc
                    ? b.username.localeCompare(a.username)
                    : a.username.localeCompare(b.username);
            }
            if (field === "createdAt") {
                return isDesc
                    ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            return 0;
        });

        // Пагинация
        const pageSize = 2; // Изменено с 5 на 2 для соответствия предыдущим версиям
        let startIndex = 0;
        if (cursor) {
            startIndex = filteredUsers.findIndex((user) => user.id === cursor) + 1;
            if (startIndex === 0 || startIndex >= filteredUsers.length) {
                return HttpResponse.json(
                    { items: [], nextCursor: null },
                    { status: 200 }
                );
            }
        }

        const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
        const nextCursor =
            paginatedUsers.length === pageSize
                ? paginatedUsers[paginatedUsers.length - 1].id
                : null;

        return HttpResponse.json(
            { items: paginatedUsers, nextCursor },
            { status: 200 }
        );
    }),

    // Получение пользователя по ID
    http.get("/api/users/:id", async ({ params, request }) => {
        await delay();

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { message: "Требуется авторизация", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const user = mockUsers.find((u) => u.id === params.id);
        if (!user) {
            return HttpResponse.json(
                { message: "Пользователь не найден", code: "NOT_FOUND" },
                { status: 404 }
            );
        }

        return HttpResponse.json(user, { status: 200 });
    }),

    // Создание пользователя
    http.post("/api/users", async ({ request }) => {
        await delay();

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { message: "Требуется авторизация", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const body = (await request.json()) as CreateUserRequest;

        if (!body.username || !body.password || !body.email) {
            return HttpResponse.json(
                { message: "Необходимы username, password и email", code: "BAD_REQUEST" },
                { status: 400 }
            );
        }

        if (mockUsers.some((u) => u.email === body.email)) {
            return HttpResponse.json(
                { message: "Пользователь с таким email уже существует", code: "USER_EXISTS" },
                { status: 409 }
            );
        }

        const newUser: UserResponse = {
            id: crypto.randomUUID(),
            username: body.username,
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            roles: body.roles || ["USER"],
            status: "PENDING",
            createdAt: new Date().toISOString(),
        };

        mockUsers.push(newUser);
        userPasswords.set(body.email, body.password);

        return HttpResponse.json(newUser, { status: 201 });
    }),

    // Обновление пользователя
    http.patch("/api/users/:id", async ({ params, request }) => {
        await delay();

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { message: "Требуется авторизация", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const userIndex = mockUsers.findIndex((u) => u.id === params.id);
        if (userIndex === -1) {
            return HttpResponse.json(
                { message: "Пользователь не найден", code: "NOT_FOUND" },
                { status: 404 }
            );
        }

        const body = (await request.json()) as UpdateUserRequest;

        if (!body.username || !body.password || !body.email) {
            return HttpResponse.json(
                { message: "Необходимы username, password и email", code: "BAD_REQUEST" },
                { status: 400 }
            );
        }

        const updatedUser: UserResponse = {
            ...mockUsers[userIndex],
            username: body.username,
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            updatedAt: new Date().toISOString(),
        };

        mockUsers[userIndex] = updatedUser;
        userPasswords.set(body.email, body.password);

        return HttpResponse.json(updatedUser, { status: 200 });
    }),

    // Удаление пользователя
    http.delete("/api/users/:id", async ({ params, request }) => {
        await delay();

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { message: "Требуется авторизация", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const userIndex = mockUsers.findIndex((u) => u.id === params.id);
        if (userIndex === -1) {
            return HttpResponse.json(
                { message: "Пользователь не найден", code: "NOT_FOUND" },
                { status: 404 }
            );
        }

        const [deletedUser] = mockUsers.splice(userIndex, 1);
        userPasswords.delete(deletedUser.email);

        return new HttpResponse(null, { status: 204 });
    }),
];