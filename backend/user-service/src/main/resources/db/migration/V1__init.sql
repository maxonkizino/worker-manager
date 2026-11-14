-- Auto-extracted from DATABASE_completed.md
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE work_schedules (
    id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       varchar(100) NOT NULL,
    type       varchar(12)  NOT NULL DEFAULT 'STANDARD',
    created_at timestamptz  NOT NULL DEFAULT now(),
    updated_at timestamptz  NOT NULL DEFAULT now(),
    version    bigint       NOT NULL DEFAULT 0,
    CONSTRAINT ux_work_schedules_name UNIQUE (name),
    CONSTRAINT ck_work_schedules_type CHECK (type IN ('STANDARD', 'SHORTENED', 'INDIVIDUAL'))
);

-- Рабочие часы по дням недели. Строки только для рабочих дней; отсутствие строки = выходной.
CREATE TABLE work_schedule_days (
    schedule_id uuid         NOT NULL,
    day_of_week smallint     NOT NULL,                           -- ISO: 1 = понедельник ... 7 = воскресенье
    hours       numeric(4,2) NOT NULL,
    CONSTRAINT pk_work_schedule_days PRIMARY KEY (schedule_id, day_of_week),
    CONSTRAINT fk_work_schedule_days_schedule FOREIGN KEY (schedule_id) REFERENCES work_schedules (id) ON DELETE CASCADE,
    CONSTRAINT ck_work_schedule_days_dow CHECK (day_of_week BETWEEN 1 AND 7),
    CONSTRAINT ck_work_schedule_days_hours CHECK (hours > 0 AND hours <= 24)
);

CREATE TABLE departments (
    id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    name             varchar(120) NOT NULL,
    description      varchar(500),
    head_employee_id uuid,                                       -- FK добавляется после создания employees
    created_at       timestamptz  NOT NULL DEFAULT now(),
    updated_at       timestamptz  NOT NULL DEFAULT now(),
    version          bigint       NOT NULL DEFAULT 0,
    CONSTRAINT ux_departments_name UNIQUE (name)
);

-- employees.id совпадает с users.id из auth_db (общий идентификатор), поэтому DEFAULT не задан.
CREATE TABLE employees (
    id                  uuid          PRIMARY KEY,
    full_name           varchar(200)  NOT NULL,
    email               varchar(254)  NOT NULL,
    position            varchar(120),
    department_id       uuid,
    schedule_id         uuid          NOT NULL,
    useful_time_factor  numeric(3,2)  NOT NULL DEFAULT 0.80,     -- k_j из формулы ёмкости (BR-02)
    active              boolean       NOT NULL DEFAULT true,     -- участвует в планировании
    telegram_chat_id    bigint,
    preferred_channel   varchar(10)   NOT NULL DEFAULT 'IN_APP',
    created_at          timestamptz   NOT NULL DEFAULT now(),
    updated_at          timestamptz   NOT NULL DEFAULT now(),
    version             bigint        NOT NULL DEFAULT 0,
    CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL,
    CONSTRAINT fk_employees_schedule   FOREIGN KEY (schedule_id)   REFERENCES work_schedules (id),
    CONSTRAINT ck_employees_factor  CHECK (useful_time_factor > 0 AND useful_time_factor <= 1),
    CONSTRAINT ck_employees_channel CHECK (preferred_channel IN ('IN_APP', 'TELEGRAM', 'EMAIL'))
);
CREATE INDEX ix_employees_department ON employees (department_id);
CREATE INDEX ix_employees_active     ON employees (active);
CREATE INDEX ix_employees_name_trgm  ON employees USING gin (lower(full_name) gin_trgm_ops);

ALTER TABLE departments
    ADD CONSTRAINT fk_departments_head FOREIGN KEY (head_employee_id) REFERENCES employees (id) ON DELETE SET NULL;

CREATE TABLE skills (
    id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        varchar(100) NOT NULL,
    description varchar(500),
    active      boolean      NOT NULL DEFAULT true,
    created_at  timestamptz  NOT NULL DEFAULT now(),
    updated_at  timestamptz  NOT NULL DEFAULT now(),
    version     bigint       NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX ux_skills_name ON skills (lower(name));

CREATE TABLE employee_skills (
    employee_id uuid        NOT NULL,
    skill_id    uuid        NOT NULL,
    level       smallint    NOT NULL,                            -- q_jk, шкала 0..5
    updated_at  timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pk_employee_skills PRIMARY KEY (employee_id, skill_id),
    CONSTRAINT fk_employee_skills_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_skills_skill    FOREIGN KEY (skill_id)    REFERENCES skills (id),
    CONSTRAINT ck_employee_skills_level CHECK (level BETWEEN 0 AND 5)
);
CREATE INDEX ix_employee_skills_skill ON employee_skills (skill_id, level);

CREATE TABLE non_working_days (
    id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    date       date         NOT NULL,
    name       varchar(150) NOT NULL,
    kind       varchar(10)  NOT NULL DEFAULT 'HOLIDAY',
    created_at timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ux_non_working_days_date UNIQUE (date),
    CONSTRAINT ck_non_working_days_kind CHECK (kind IN ('HOLIDAY', 'DAY_OFF', 'TRANSFER'))
);

CREATE TABLE absences (
    id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id      uuid         NOT NULL,
    type             varchar(15)  NOT NULL,
    start_date       date         NOT NULL,
    end_date         date         NOT NULL,
    status           varchar(10)  NOT NULL DEFAULT 'PENDING',
    comment          varchar(500),
    decided_by       uuid,                                       -- employees.id руководителя
    decided_at       timestamptz,
    decision_comment varchar(500),
    created_at       timestamptz  NOT NULL DEFAULT now(),
    updated_at       timestamptz  NOT NULL DEFAULT now(),
    version          bigint       NOT NULL DEFAULT 0,
    CONSTRAINT fk_absences_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT ck_absences_type   CHECK (type IN ('VACATION', 'SICK_LEAVE', 'BUSINESS_TRIP', 'STUDY_LEAVE', 'OTHER')),
    CONSTRAINT ck_absences_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    CONSTRAINT ck_absences_period CHECK (end_date >= start_date),
    CONSTRAINT ck_absences_decision CHECK ((status = 'PENDING') = (decided_at IS NULL)),
    -- согласованные отсутствия одного сотрудника не пересекаются
    CONSTRAINT ex_absences_no_overlap EXCLUDE USING gist (
        employee_id WITH =,
        daterange(start_date, end_date, '[]') WITH &&
    ) WHERE (status = 'APPROVED')
);
CREATE INDEX ix_absences_employee_period ON absences (employee_id, start_date, end_date);
CREATE INDEX ix_absences_status ON absences (status, start_date);

-- Единственная строка актуальных параметров (FR-26).
CREATE TABLE calculation_settings (
    id                  smallint     PRIMARY KEY DEFAULT 1,
    useful_time_factor  numeric(3,2) NOT NULL DEFAULT 0.80,     -- значение по умолчанию для новых сотрудников
    overload_threshold  numeric(4,2) NOT NULL DEFAULT 1.00,
    underload_threshold numeric(4,2) NOT NULL DEFAULT 0.50,
    alpha               numeric(8,3) NOT NULL DEFAULT 1,        -- штраф за несоответствие компетенций
    beta                numeric(8,3) NOT NULL DEFAULT 10,       -- штраф за перегрузку
    gamma               numeric(8,3) NOT NULL DEFAULT 1,        -- неравномерность загрузки
    delta               numeric(8,3) NOT NULL DEFAULT 5,        -- запаздывание
    horizon_days        integer      NOT NULL DEFAULT 14,
    updated_at          timestamptz  NOT NULL DEFAULT now(),
    updated_by          uuid,
    version             bigint       NOT NULL DEFAULT 0,
    CONSTRAINT ck_settings_single    CHECK (id = 1),
    CONSTRAINT ck_settings_factor    CHECK (useful_time_factor > 0 AND useful_time_factor <= 1),
    CONSTRAINT ck_settings_threshold CHECK (underload_threshold > 0 AND underload_threshold < overload_threshold),
    CONSTRAINT ck_settings_weights   CHECK (alpha >= 0 AND beta >= 0 AND gamma >= 0 AND delta >= 0),
    CONSTRAINT ck_settings_horizon   CHECK (horizon_days > 0)
);
INSERT INTO calculation_settings (id) VALUES (1);

CREATE TRIGGER trg_work_schedules_updated BEFORE UPDATE ON work_schedules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_departments_updated    BEFORE UPDATE ON departments    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_employees_updated      BEFORE UPDATE ON employees      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_skills_updated         BEFORE UPDATE ON skills         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_absences_updated       BEFORE UPDATE ON absences       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_settings_updated       BEFORE UPDATE ON calculation_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE OR REPLACE FUNCTION employee_daily_capacity(p_from date, p_to date)
RETURNS TABLE (employee_id uuid, day date, nominal_hours numeric, capacity_hours numeric)
LANGUAGE sql STABLE AS $$
    SELECT e.id,
           d.day::date,
           CASE WHEN n.id IS NOT NULL OR a.id IS NOT NULL THEN 0 ELSE COALESCE(sd.hours, 0) END,
           CASE WHEN n.id IS NOT NULL OR a.id IS NOT NULL THEN 0 ELSE COALESCE(sd.hours, 0) END * e.useful_time_factor
    FROM employees e
    CROSS JOIN generate_series(p_from, p_to, interval '1 day') AS d(day)
    LEFT JOIN work_schedule_days sd
           ON sd.schedule_id = e.schedule_id AND sd.day_of_week = extract(isodow FROM d.day)::smallint
    LEFT JOIN non_working_days n ON n.date = d.day::date
    LEFT JOIN absences a
           ON a.employee_id = e.id AND a.status = 'APPROVED' AND d.day::date BETWEEN a.start_date AND a.end_date
    WHERE e.active
$$;


CREATE TABLE IF NOT EXISTS outbox_events (
    id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type varchar(80)  NOT NULL,
    aggregate_id   uuid         NOT NULL,
    event_type     varchar(120) NOT NULL,
    payload        jsonb        NOT NULL,
    occurred_at    timestamptz  NOT NULL DEFAULT now(),
    published_at   timestamptz,
    attempts       integer      NOT NULL DEFAULT 0,
    last_error     varchar(2000),
    CONSTRAINT ck_outbox_attempts CHECK (attempts >= 0)
);
CREATE INDEX IF NOT EXISTS ix_outbox_unpublished
    ON outbox_events (occurred_at)
    WHERE published_at IS NULL;


CREATE TABLE IF NOT EXISTS processed_events (
    event_id      uuid         PRIMARY KEY,
    event_type    varchar(120) NOT NULL,
    processed_at  timestamptz  NOT NULL DEFAULT now(),
    consumer_name varchar(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_processed_events_processed_at
    ON processed_events (processed_at);
