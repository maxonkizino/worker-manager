# React + TypeScript + Vite

1. Новые хуки (в папке miro-code/src/features/boards-list/model/):
use-users-list.ts: Этот хук будет отвечать за получение списка пользователей из бэкенда. Он заменит useBoardsList. Он будет вызывать API getAllUsers из user.yaml.
Он должен принимать параметры для сортировки и поиска, как useBoardsList.
use-users-filters.ts: Этот хук будет управлять состоянием фильтров и сортировки для списка пользователей. Он заменит useBoardsFilters.
Он будет обрабатывать логику для search (по имени пользователя, email) и sort (например, по имени, дате создания, роли).
use-create-user.ts: Этот хук будет содержать логику для создания нового пользователя. Он заменит useCreateBoard.
Он будет вызывать API createUser из user.yaml и принимать данные для CreateUserRequest.
2. Новые UI компоненты (в папке miro-code/src/features/boards-list/compose/ или ui/):
user-item.tsx: Компонент для отображения одного пользователя в режиме списка. Он заменит BoardItem.
Будет принимать UserResponse в качестве пропсов и отображать такие поля, как username, email, roles, status.
user-card.tsx: Компонент для отображения одного пользователя в режиме сетки (карточки). Он заменит BoardCard.
Также будет принимать UserResponse и отображать аналогичную информацию.
3. Адаптация существующей страницы boards-list-user.page.tsx:
В самом файле boards-list-user.page.tsx (который мы, возможно, переименуем в users-list.page.tsx для ясности, но пока оставим как есть), нам нужно будет изменить следующее:
Импорты: Заменить импорты, связанные с досками, на новые, связанные с пользователями (например, useBoardsList на useUsersList).
Использование хуков: Заменить вызовы useBoardsFilters(), useBoardsList(), useCreateBoard() на useUsersFilters(), useUsersList(), useCreateUser().
BoardsListLayoutHeader:
Изменить title с "Доски" на "Пользователи".
Изменить description на что-то вроде "Здесь вы можете просматривать и управлять пользователями".
Убрать кнопку "Выбрать шаблон".
Изменить кнопку "Создать доску" на "Создать пользователя" и привязать ее к логике useCreateUser.
BoardsListLayoutFilters:
Заменить BoardsSortSelect на новый UsersSortSelect (который вы создадите).
BoardsSearchInput может быть использован, но если он будет иметь специфичную логику для поиска пользователей, то лучше создать UsersSearchInput.
BoardsListLayoutContent:
В renderList заменить BoardItem на UserItem.
В renderGrid заменить BoardCard на UserCard.
Обновить isEmpty и другие пропсы, чтобы они ссылались на usersQuery.users.length.
Удалить TemplatesModal и TemplatesGallery: Они больше не нужны.