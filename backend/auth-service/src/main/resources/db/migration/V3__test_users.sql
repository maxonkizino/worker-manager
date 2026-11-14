-- Тестовые учётные записи: логин и пароль совпадают. По одной на роль.
INSERT INTO users (id, username, email, password_hash, full_name)
SELECT '11111111-1111-1111-1111-111111111111', '111', '111@taskflow.local',
       '$2b$10$UXWkLhRV5AI8iJmvWHW6jeDfx.gXKjWp1yIBuuHeHMa.RF2V9l7ty', 'Администратор'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE lower(username) = '111');

INSERT INTO users (id, username, email, password_hash, full_name)
SELECT '22222222-2222-2222-2222-222222222222', '222', '222@taskflow.local',
       '$2b$10$eFuq4ghNhqVROEDLR8HQZOFyVvWAQLrIrar51B18ggbFSYxgdd/je', 'Руководитель'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE lower(username) = '222');

INSERT INTO users (id, username, email, password_hash, full_name)
SELECT '33333333-3333-3333-3333-333333333333', '333', '333@taskflow.local',
       '$2b$10$hLhuohxvXDJCrnKoo0Y.neCTW61M/0nOTaiULvbRuyq0bwuznG/u2', 'Сотрудник'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE lower(username) = '333');

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_ADMIN' FROM users WHERE lower(username) = '111'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_MANAGER' FROM users WHERE lower(username) = '222'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_EMPLOYEE' FROM users WHERE lower(username) = '333'
ON CONFLICT DO NOTHING;
