import { delay, HttpResponse } from "msw";
import { http } from "../http";
import { ApiSchemas } from "../../schema";
import { verifyTokenOrThrow } from "../session";

// Временные handlers для совместимости - мапим boards запросы на tasks данные
// Это позволяет фронту работать без изменений, пока не трансформируем компоненты

// Генерируем моковые "доски" из задач
function generateMockBoards(count: number = 50): ApiSchemas["Board"][] {
  const result: ApiSchemas["Board"][] = [];
  const boardNames = [
    "Разработка нового функционала",
    "Исправление багов",
    "Код-ревью задач",
    "Планирование спринта",
    "Тестирование системы",
    "Документация API",
    "Развертывание на production",
    "Анализ производительности",
    "Обновление зависимостей",
    "Рефакторинг кодовой базы"
  ];

  for (let i = 0; i < count; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    const updatedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    const lastOpenedAt = new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString();

    result.push({
      id: crypto.randomUUID(),
      name: boardNames[i % boardNames.length] + ` ${Math.floor(i / boardNames.length) + 1}`,
      createdAt,
      updatedAt,
      lastOpenedAt,
      isFavorite: Math.random() > 0.7,
    });
  }

  return result;
}

const boards: ApiSchemas["Board"][] = generateMockBoards();

export const boardsHandlers = [
  http.get("/boards", async (ctx) => {
    await verifyTokenOrThrow(ctx.request);

    const url = new URL(ctx.request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const search = url.searchParams.get("search");
    const isFavorite = url.searchParams.get("isFavorite");
    const sort = url.searchParams.get("sort");

    let filteredBoards = [...boards];

    // Фильтрация по поиску
    if (search) {
      filteredBoards = filteredBoards.filter((board) =>
        board.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Фильтрация по избранному
    if (isFavorite !== null) {
      const isFav = isFavorite === "true";
      filteredBoards = filteredBoards.filter(
        (board) => board.isFavorite === isFav,
      );
    }

    // Сортировка
    if (sort) {
      filteredBoards.sort((a, b) => {
        if (sort === "name") {
          return a.name.localeCompare(b.name);
        } else {
          // Для дат (createdAt, updatedAt, lastOpenedAt)
          return (
            new Date(
              b[sort as keyof ApiSchemas["Board"]].toString(),
            ).getTime() -
            new Date(a[sort as keyof ApiSchemas["Board"]].toString()).getTime()
          );
        }
      });
    }

    const total = filteredBoards.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBoards = filteredBoards.slice(startIndex, endIndex);

    await delay(300);

    return HttpResponse.json({
      list: paginatedBoards,
      total,
      totalPages,
    });
  }),

  http.get("/boards/{boardId}", async ({ params, request }) => {
    await verifyTokenOrThrow(request);
    const { boardId } = params;
    const board = boards.find((board) => board.id === boardId);

    if (!board) {
      return HttpResponse.json(
        { message: "Board not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Обновляем lastOpenedAt при просмотре доски
    board.lastOpenedAt = new Date().toISOString();
    await delay(200);
    return HttpResponse.json(board);
  }),

  http.post("/boards", async (ctx) => {
    await verifyTokenOrThrow(ctx.request);

    const now = new Date().toISOString();
    const board: ApiSchemas["Board"] = {
      id: crypto.randomUUID(),
      name: "Новая доска задач",
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      isFavorite: false,
    };

    boards.push(board);
    await delay(500);
    return HttpResponse.json(board, { status: 201 });
  }),

  http.put("/boards/{boardId}/favorite", async ({ params, request }) => {
    await verifyTokenOrThrow(request);
    const { boardId } = params;
    const board = boards.find((board) => board.id === boardId);

    if (!board) {
      return HttpResponse.json(
        { message: "Board not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    const data = (await request.json()) as ApiSchemas["UpdateBoardFavorite"];
    board.isFavorite = data.isFavorite;
    board.updatedAt = new Date().toISOString();

    await delay(300);
    return HttpResponse.json(board, { status: 201 });
  }),

  http.put("/boards/{boardId}/rename", async ({ params, request }) => {
    await verifyTokenOrThrow(request);
    const { boardId } = params;
    const board = boards.find((board) => board.id === boardId);

    if (!board) {
      return HttpResponse.json(
        { message: "Board not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    const data = (await request.json()) as ApiSchemas["RenameBoard"];
    board.name = data.name;
    board.updatedAt = new Date().toISOString();

    await delay(400);
    return HttpResponse.json(board, { status: 201 });
  }),

  http.delete("/boards/{boardId}", async ({ params, request }) => {
    await verifyTokenOrThrow(request);
    const { boardId } = params;
    const index = boards.findIndex((board) => board.id === boardId);
    
    if (index === -1) {
      return HttpResponse.json(
        { message: "Board not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    boards.splice(index, 1);
    await delay(500);
    return new HttpResponse(null, { status: 204 });
  }),
];
