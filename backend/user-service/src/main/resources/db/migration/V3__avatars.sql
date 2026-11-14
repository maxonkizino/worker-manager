ALTER TABLE employees
    ADD COLUMN avatar_preset varchar(40),
    ADD COLUMN avatar_revision integer NOT NULL DEFAULT 0;

ALTER TABLE employees
    ADD CONSTRAINT ck_employees_avatar_revision CHECK (avatar_revision >= 0);

CREATE TABLE employee_avatars (
    employee_id  uuid         PRIMARY KEY,
    content_type varchar(64)  NOT NULL,
    data         bytea        NOT NULL,
    updated_at   timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT fk_employee_avatars_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT ck_employee_avatars_type CHECK (content_type IN ('image/png', 'image/jpeg', 'image/webp')),
    CONSTRAINT ck_employee_avatars_size CHECK (octet_length(data) BETWEEN 1 AND 1048576)
);
