# TaskFlow Planner

Программное средство планирования деятельности сотрудников с модулем анализа и оптимизации распределения задач.

Архитектура: `ARCHITECTURE.md`  
Схемы БД: `DATABASE_completed.md`

## Стек

- **Frontend:** React + TypeScript + Vite + FSD
- **Backend:** Java 21, Spring Boot 3.5, Spring Cloud Gateway / Eureka
- **БД:** PostgreSQL 16 (database per service)
- **События:** Apache Kafka
- **Кэш:** Redis

## Сервисы

| Сервис | Порт | БД |
| --- | --- | --- |
| api-gateway | 8080 | — |
| auth-service | 8081 | auth_db |
| user-service | 8082 | user_db |
| task-service | 8083 | task_db |
| analytics-service | 8084 | analytics_db |
| optimization-service | 8085 | optimization_db |
| notification-service | 8086 | notification_db |
| discovery (Eureka) | 8761 | — |
| frontend | 5173 | — |

Config Server не используется. Подключения, пароль БД и JWT лежат в `backend/.env`.

## Быстрый старт

Из каталога `backend` соберите jar-файлы и поднимите все контейнеры. Config Server не входит в compose. Пароль БД и `JWT_SECRET` берутся из `backend/.env`.

```powershell
cd backend
$modules = @(
  'discovery-service','auth-service','user-service','task-service',
  'analytics-service','optimization-service','notification-service','gateway-service'
)
foreach ($module in $modules) { mvn -f "$module/pom.xml" package -DskipTests }
docker compose up -d --build
```

Postgres контейнера на хосте слушает **`localhost:5433`**. Сервисы внутри сети Docker ходят на `postgres:5432`. Gateway снаружи — **`localhost:8080`**, интерфейс — **http://localhost:5173**.

Фронтенд входит в тот же `docker compose up`. Nginx отдаёт собранное приложение и проксирует `/api` на gateway. Пока Java-код не менялся, заново собирать backend не нужно: уже запущенные контейнеры достаточно.

### Тесты backend

```bash
cd backend/auth-service && mvn test
cd backend/user-service && mvn test
cd backend/task-service && mvn test
```

## Роли

- `ROLE_ADMIN` — пользователи, настройки, справочники
- `ROLE_MANAGER` — проекты, назначения, оптимизация, согласование отсутствий
- `ROLE_EMPLOYEE` — свои задачи, учёт времени, заявки на отсутствие
