import { delay, HttpResponse } from "msw";
import { http } from "../http";
import { ApiSchemas } from "../../schema";
import { verifyTokenOrThrow } from "../session";

// Функция для генерации случайной даты в пределах последних 30 дней
function randomDate() {
  const start = new Date();
  start.setDate(start.getDate() - 30);

  const end = new Date();

  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  ).toISOString();
}

// Функция для генерации случайного названия доски
function generateBoardName() {
  const adjectives = [
    "Стратегический",
    "Креативный",
    "Инновационный",
    "Годовой",
    "Квартальный",
    "Важный",
    "Срочный",
    "Ключевой",
    "Долгосрочный",
    "Оперативный",
    "Тактический",
    "Аналитический",
    "Исследовательский",
  ];

  const nouns = [
    "План",
    "Проект",
    "Дизайн",
    "Отчет",
    "Анализ",
    "Концепт",
    "Процесс",
    "Прототип",
    "Обзор",
    "Презентация",
    "Маркетинг",
    "Разработка",
    "Бюджет",
    "Исследование",
    "Запуск",
    "Совещание",
  ];

  const themes = [
    "Продукта",
    "Команды",
    "Компании",
    "Кампании",
    "Стратегии",
    "Рынка",
    "Бренда",
    "Бизнеса",
    "Проекта",
    "Квартала",
    "Года",
    "Пользователя",
    "Клиента",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];

  return `${randomAdjective} ${randomNoun} ${randomTheme}`;
}

// Генерация 1000 случайных досок
function generateRandomBoards(count: number): ApiSchemas["Board"][] {
  const result: ApiSchemas["Board"][] = [];

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate();
    const updatedAt = new Date(
      Math.min(
        new Date(createdAt).getTime() + Math.random() * 86400000 * 10,
        new Date().getTime(),
      ),
    ).toISOString(); // Добавляем до 10 дней
    const lastOpenedAt = new Date(
      Math.min(
        new Date(updatedAt).getTime() + Math.random() * 86400000 * 5,
        new Date().getTime(),
      ),
    ).toISOString(); // Добавляем до 5 дней

    result.push({
      id: crypto.randomUUID(),
      name: generateBoardName(),
      createdAt,
      updatedAt,
      lastOpenedAt,
      isFavorite: Math.random() > 0.7, // Примерно 30% досок будут избранными
    });
  }

  return result;
}

// Создаем 1000 случайных досок
const boards: ApiSchemas["Board"][] = generateRandomBoards(1000);

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
    return HttpResponse.json(board);
  }),

  http.post("/boards", async (ctx) => {
    await verifyTokenOrThrow(ctx.request);

    const now = new Date().toISOString();
    const board: ApiSchemas["Board"] = {
      id: crypto.randomUUID(),
      name: "New Board",
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      isFavorite: false,
    };

    boards.push(board);
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

    return HttpResponse.json(board, { status: 201 });
  }),

  http.delete("/boards/{boardId}", async ({ params, request }) => {
    await verifyTokenOrThrow(request);
    const { boardId } = params;
    const index = boards.findIndex((board) => board.id === boardId);
    await delay(1000);
    if (index === -1) {
      return HttpResponse.json(
        { message: "Board not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    boards.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
