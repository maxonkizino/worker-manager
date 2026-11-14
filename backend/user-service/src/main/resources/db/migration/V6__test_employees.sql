-- Профили тестовых пользователей 111, 222 и 333. Идентификаторы совпадают с auth_db.users.
INSERT INTO employees (id, full_name, email, position, schedule_id, useful_time_factor)
SELECT '11111111-1111-1111-1111-111111111111', 'Администратор', '111@taskflow.local', 'Администратор',
       'a0000000-0000-0000-0000-000000000001', 0.80
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE id = '11111111-1111-1111-1111-111111111111');

INSERT INTO employees (id, full_name, email, position, schedule_id, useful_time_factor)
SELECT '22222222-2222-2222-2222-222222222222', 'Руководитель', '222@taskflow.local', 'Руководитель',
       'a0000000-0000-0000-0000-000000000001', 0.80
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE id = '22222222-2222-2222-2222-222222222222');

INSERT INTO employees (id, full_name, email, position, schedule_id, useful_time_factor)
SELECT '33333333-3333-3333-3333-333333333333', 'Сотрудник', '333@taskflow.local', 'Сотрудник',
       'a0000000-0000-0000-0000-000000000001', 0.80
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE id = '33333333-3333-3333-3333-333333333333');
