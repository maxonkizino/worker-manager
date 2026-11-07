import { delay, HttpResponse } from "msw";
import { http } from "../http";
import { components } from "../../schema/generated";
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

// Функция для генерации случайной даты в будущем (дедлайны)
function randomFutureDate() {
  const start = new Date();
  start.setDate(start.getDate() + 1); // завтра
  const end = new Date();
  end.setDate(end.getDate() + 30); // через 30 дней
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  ).toISOString();
}

// Функция для генерации случайного названия задачи
function generateTaskTitle() {
  const prefixes = [
    "Разработать", "Внедрить", "Оптимизировать", "Исследовать", "Создать", 
    "Улучшить", "Протестировать", "Документировать", "Настроить", "Проанализировать",
    "Обновить", "Интегрировать", "Подготовить", "Запустить", "Проверить"
  ];

  const objects = [
    "новый модуль", "систему мониторинга", "API интеграцию", "пользовательский интерфейс",
    "базу данных", "отчетную систему", "процесс автоматизации", "безопасность системы",
    "производительность приложения", "систему уведомлений", "мобильное приложение",
    "веб-портал", "систему аналитики", "процесс деплоя", "документацию проекта"
  ];

  const contexts = [
    "для отдела HR", "в CRM системе", "на производстве", "в финансовом модуле",
    "для клиентского сервиса", "в системе управления", "на веб-платформе",
    "для мобильных устройств", "в корпоративной сети", "для внешних партнеров"
  ];

  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomObject = objects[Math.floor(Math.random() * objects.length)];
  const randomContext = Math.random() > 0.3 ? ` ${contexts[Math.floor(Math.random() * contexts.length)]}` : "";

  return `${randomPrefix} ${randomObject}${randomContext}`;
}

// Функция для генерации описания задачи
function generateTaskDescription() {
  const descriptions = [
    "Необходимо провести полный анализ требований и разработать техническое решение с учетом существующей архитектуры системы.",
    "Требуется внедрить новую функциональность с соблюдением стандартов кодирования и лучших практик разработки.",
    "Задача включает в себя исследование, планирование, реализацию и тестирование предложенного решения.",
    "Необходимо обеспечить совместимость с текущими системами и провести migration существующих данных.",
    "Требуется создать подробную документацию и провести обучение команды по новому функционалу.",
    "Задача предполагает работу в команде с другими разработчиками и координацию с менеджментом проекта.",
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Mock пользователи для назначения задач
const mockUserIds = [
  "550e8400-e29b-41d4-a716-446655440001", // admin
  "550e8400-e29b-41d4-a716-446655440002", // employee  
  "550e8400-e29b-41d4-a716-446655440003", // manager
];

// Генерация случайных задач
function generateRandomTasks(count: number): components["schemas"]["TaskResponse"][] {
  const result: components["schemas"]["TaskResponse"][] = [];
  const statuses: NonNullable<components["schemas"]["TaskResponse"]["status"]>[] = ["AVAILABLE", "IN_PROGRESS", "COMPLETED", "BLOCKED"];
  const priorities: NonNullable<components["schemas"]["TaskResponse"]["priority"]>[] = ["LOW", "MEDIUM", "HIGH"];
  const departments: NonNullable<components["schemas"]["TaskResponse"]["department"]>[] = ["IT", "HR", "FINANCE", "MARKETING", "SALES", "CUSTOMER_SERVICE", "PRODUCTION", "LOGISTICS", "RESEARCH_AND_DEVELOPMENT", "OTHER"];

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate();

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const assigneeIds = status === "AVAILABLE" ? undefined : 
      Math.random() > 0.5 ? [mockUserIds[Math.floor(Math.random() * mockUserIds.length)]] : undefined;

    result.push({
      id: crypto.randomUUID(),
      title: generateTaskTitle(),
      description: Math.random() > 0.3 ? generateTaskDescription() : undefined,
      status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      assigneeIds: assigneeIds,
      creatorId: mockUserIds[Math.floor(Math.random() * mockUserIds.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      createdAt,
      dueDate: Math.random() > 0.4 ? randomFutureDate() : undefined,
      tags: Math.random() > 0.6 ? 
        ["frontend", "backend", "urgent", "bug", "feature"].slice(0, Math.floor(Math.random() * 3) + 1) : 
        undefined,
      comments: undefined, 
    });
  }

  return result;
}

// Создаем 1000 случайных задач
const tasks: components["schemas"]["TaskResponse"][] = generateRandomTasks(1000);

export const tasksHandlers = [
  // Получить все задачи
  http.get("/v1/tasks", async (ctx) => {
    await verifyTokenOrThrow(ctx.request);

    const url = new URL(ctx.request.url);
    const page = Number(url.searchParams.get("page") || 0);
    const size = Number(url.searchParams.get("size") || 10);
    const search = url.searchParams.get("search");
    const status = url.searchParams.get("status") as components["schemas"]["TaskResponse"]["status"];
    const department = url.searchParams.get("department") as components["schemas"]["TaskResponse"]["department"];
    const assigneeId = url.searchParams.get("assigneeId");
    const creatorId = url.searchParams.get("creatorId");
    const sort = url.searchParams.get("sort") || "createdAt";

    let filteredTasks = [...tasks];

    // Фильтрация по поиску
    if (search) {
      filteredTasks = filteredTasks.filter((task) =>
        task.title?.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Фильтрация по статусу
    if (status) {
      filteredTasks = filteredTasks.filter((task) => task.status === status);
    }

    // Фильтрация по отделу
    if (department) {
      filteredTasks = filteredTasks.filter((task) => task.department === department);
    }

    // Фильтрация по исполнителю
    if (assigneeId) {
      filteredTasks = filteredTasks.filter((task) => 
        task.assigneeIds && task.assigneeIds.includes(assigneeId)
      );
    }

    // Фильтрация по создателю
    if (creatorId) {
      filteredTasks = filteredTasks.filter((task) => task.creatorId === creatorId);
    }

    // Сортировка
    filteredTasks.sort((a, b) => {
      if (sort === "title") {
        return (a.title || "").localeCompare(b.title || "");
      } else if (sort === "priority") {
        const priorityOrder: Record<NonNullable<components["schemas"]["TaskResponse"]["priority"]>, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
        return (priorityOrder[b.priority!] || 0) - (priorityOrder[a.priority!] || 0);
      } else {
        // Для дат (createdAt, dueDate)
        const aDate = a[sort as keyof components["schemas"]["TaskResponse"]] as string | undefined;
        const bDate = b[sort as keyof components["schemas"]["TaskResponse"]] as string | undefined;
        return new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime();
      }
    });

    const totalElements = filteredTasks.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    await delay(500); // имитация сетевой задержки

    return HttpResponse.json({
      content: paginatedTasks,
      totalElements,
      totalPages,
      size,
      number: page,
    });
  }),

  // Получить мои задачи
  http.get("/v1/me/tasks", async (ctx) => {
    const session = await verifyTokenOrThrow(ctx.request);
    
    const url = new URL(ctx.request.url);
    const page = Number(url.searchParams.get("page") || 0);
    const size = Number(url.searchParams.get("size") || 10);
    const status = url.searchParams.get("status") as components["schemas"]["TaskResponse"]["status"];

    let filteredTasks = tasks.filter((task) => 
      task.assigneeIds && task.assigneeIds.includes(session.userId)
    );

    // Фильтрация по статусу
    if (status) {
      filteredTasks = filteredTasks.filter((task) => task.status === status);
    }

    // Сортировка по дате создания (новые сначала)
    filteredTasks.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const totalElements = filteredTasks.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    await delay(300);

    return HttpResponse.json({
      content: paginatedTasks,
      totalElements,
      totalPages,
      size,
      number: page,
    });
  }),

  // Получить доступные задачи
  http.get("/v1/me/available-tasks", async (ctx) => {
    await verifyTokenOrThrow(ctx.request);
    
    const url = new URL(ctx.request.url);
    const page = Number(url.searchParams.get("page") || 0);
    const size = Number(url.searchParams.get("size") || 10);
    const department = url.searchParams.get("department") as components["schemas"]["TaskResponse"]["department"];

    let filteredTasks = tasks.filter((task) => task.status === "AVAILABLE");

    // Фильтрация по отделу
    if (department) {
      filteredTasks = filteredTasks.filter((task) => task.department === department);
    }

    // Сортировка по приоритету и дате создания
    filteredTasks.sort((a, b) => {
      const priorityOrder: Record<NonNullable<components["schemas"]["TaskResponse"]["priority"]>, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
      const priorityDiff = (priorityOrder[b.priority!] || 0) - (priorityOrder[a.priority!] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const totalElements = filteredTasks.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    await delay(300);

    return HttpResponse.json({
      content: paginatedTasks,
      totalElements,
      totalPages,
      size,
      number: page,
    });
  }),

  // Получить задачу по ID
  http.get("/v1/tasks/{id}", async ({ params, request }) => {
    await verifyTokenOrThrow(request);
    const { id } = params;
    const task = tasks.find((task) => task.id === id);

    if (!task) {
      return HttpResponse.json(
        { message: "Task not found", code: "NOT_FOUND" } as components["responses"]["NotFoundError"]["content"]["application/json"],
        { status: 404 },
      );
    }

    await delay(200);
    return HttpResponse.json(task);
  }),

  // Создать новую задачу
  http.post("/v1/tasks", async (ctx) => {
    const session = await verifyTokenOrThrow(ctx.request);
    const body = await ctx.request.json() as components["schemas"]["CreateTaskRequest"];

    const now = new Date().toISOString();
    const priority: NonNullable<components["schemas"]["TaskResponse"]["priority"]> = body.priority === "URGENT" ? "HIGH" : body.priority || "MEDIUM";

    const task: components["schemas"]["TaskResponse"] = {
      id: crypto.randomUUID(),
      title: body.title,
      description: body.description,
      status: "AVAILABLE", // Default status for new tasks
      priority,
      assigneeIds: undefined,
      creatorId: session.userId,
      department: body.department || "IT",
      createdAt: now,
      dueDate: body.dueDate,
      tags: body.tags || undefined,
      comments: undefined, 
    };

    tasks.push(task);
    await delay(500);
    return HttpResponse.json(task, { status: 201 });
  }),

  // Обновить задачу
  http.put("/v1/tasks/{id}", async ({ params, request }) => {
    await verifyTokenOrThrow(request);
    const { id } = params;
    const task = tasks.find((task) => task.id === id);

    if (!task) {
      return HttpResponse.json(
        { message: "Task not found", code: "NOT_FOUND" } as components["responses"]["NotFoundError"]["content"]["application/json"],
        { status: 404 },
      );
    }

    const body = await request.json() as components["schemas"]["UpdateTaskRequest"];
    
    // Обновляем поля
    if (body.title !== undefined) task.title = body.title;
    if (body.description !== undefined) task.description = body.description;
    if (body.status !== undefined) {
        const newStatus: NonNullable<components["schemas"]["TaskResponse"]["status"]> = body.status === "ASSIGNED" || body.status === "REVIEW" || body.status === "CANCELLED" ? "IN_PROGRESS" : body.status;
        task.status = newStatus;
    }
    if (body.priority !== undefined) {
        const newPriority: NonNullable<components["schemas"]["TaskResponse"]["priority"]> = body.priority === "URGENT" ? "HIGH" : body.priority;
        task.priority = newPriority;
    }
    if (body.dueDate !== undefined) task.dueDate = body.dueDate;
    if (body.tags !== undefined) task.tags = body.tags;
    
    await delay(400);
    return HttpResponse.json(task);
  }),

  // Удалить задачу
  http.delete("/v1/tasks/{id}", async ({ params, request }) => {
    await verifyTokenOrThrow(request);
    const { id } = params;
    const index = tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { message: "Task not found", code: "NOT_FOUND" } as components["responses"]["NotFoundError"]["content"]["application/json"],
        { status: 404 },
      );
    }

    tasks.splice(index, 1);
    await delay(500);
    return new HttpResponse(null, { status: 204 });
  }),

  // Обновить исполнителей задачи (PATCH)
  http.patch("/v1/tasks/{id}/assignees", async ({ params, request }) => {
    await verifyTokenOrThrow(request);
    const { id } = params;
    const task = tasks.find((task) => task.id === id);

    if (!task) {
      return HttpResponse.json(
        { message: "Task not found", code: "NOT_FOUND" } as components["responses"]["NotFoundError"]["content"]["application/json"],
        { status: 404 },
      );
    }

    const body = await request.json() as components["schemas"]["UpdateAssigneesRequest"];
    task.assigneeIds = body.assigneeIds;
    if (task.assigneeIds && task.assigneeIds.length > 0) {
        task.status = "IN_PROGRESS";
    } else {
        task.status = "AVAILABLE";
    }

    await delay(400);
    return HttpResponse.json(task);
  }),

  // Подписаться на задачу (самоназначение) (PATCH)
  http.patch("/v1/me/tasks/{id}/subscribe", async ({ params, request }) => {
    const session = await verifyTokenOrThrow(request);
    const { id } = params;
    const task = tasks.find((task) => task.id === id);

    if (!task) {
      return HttpResponse.json(
        { message: "Task not found", code: "NOT_FOUND" } as components["responses"]["NotFoundError"]["content"]["application/json"],
        { status: 404 },
      );
    }

    if (task.status !== "AVAILABLE") {
      return HttpResponse.json(
        { message: "Task is not available for subscription", code: "TASK_NOT_AVAILABLE" } as components["schemas"]["Error"],
        { status: 400 },
      );
    }

    task.assigneeIds = [session.userId];
    task.status = "IN_PROGRESS";

    await delay(400);
    return HttpResponse.json(task);
  }),
];
