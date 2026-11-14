ALTER TABLE employees
    ADD COLUMN use_custom_avatar boolean NOT NULL DEFAULT false;

UPDATE employees AS employee
SET use_custom_avatar = true
WHERE EXISTS (
    SELECT 1 FROM employee_avatars AS avatar WHERE avatar.employee_id = employee.id
);
