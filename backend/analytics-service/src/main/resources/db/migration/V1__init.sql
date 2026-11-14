-- Auto-extracted from DATABASE_completed.md
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE employee_snapshots (
    employee_id     uuid         PRIMARY KEY, -- employees.id из user_db
    full_name       varchar(200) NOT NULL,
    department_id   uuid,
    department_name varchar(120),
    position        varchar(120),
    active          boolean      NOT NULL,
    captured_at     timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX ix_employee_snapshots_department ON employee_snapshots (department_id);

CREATE TABLE task_facts (
    task_id         uuid         PRIMARY KEY, -- tasks.id из task_db
    project_id      uuid         NOT NULL,
    project_name    varchar(200),
    assignee_id     uuid,                     -- employees.id из user_db
    status          varchar(15)  NOT NULL,
    priority        varchar(10)  NOT NULL,
    planned_start   date,
    planned_end     date,
    estimated_hours numeric(8,2) NOT NULL,
    actual_hours    numeric(8,2) NOT NULL DEFAULT 0,
    source_updated_at timestamptz,
    captured_at     timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_task_facts_status CHECK (status IN ('CREATED', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
    CONSTRAINT ck_task_facts_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT ck_task_facts_hours CHECK (estimated_hours > 0 AND actual_hours >= 0)
);
CREATE INDEX ix_task_facts_project ON task_facts (project_id);
CREATE INDEX ix_task_facts_assignee_status ON task_facts (assignee_id, status);
CREATE INDEX ix_task_facts_deadline ON task_facts (planned_end) WHERE status NOT IN ('DONE', 'CANCELLED');

CREATE TABLE time_entry_facts (
    source_entry_id uuid         PRIMARY KEY, -- time_entries.id из task_db
    task_id         uuid         NOT NULL,
    project_id      uuid         NOT NULL,
    employee_id     uuid         NOT NULL,
    work_date       date         NOT NULL,
    hours           numeric(6,2) NOT NULL,
    captured_at     timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_time_entry_facts_hours CHECK (hours > 0 AND hours <= 24)
);
CREATE INDEX ix_time_entry_facts_employee_date ON time_entry_facts (employee_id, work_date);
CREATE INDEX ix_time_entry_facts_task_date ON time_entry_facts (task_id, work_date);
CREATE INDEX ix_time_entry_facts_project_date ON time_entry_facts (project_id, work_date);

CREATE TABLE workload_snapshots (
    id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     uuid         NOT NULL,
    snapshot_date   date         NOT NULL,
    capacity_hours  numeric(8,2) NOT NULL,
    planned_hours   numeric(8,2) NOT NULL DEFAULT 0,
    actual_hours    numeric(8,2) NOT NULL DEFAULT 0,
    utilization     numeric(8,4),
    created_at      timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ux_workload_employee_date UNIQUE (employee_id, snapshot_date),
    CONSTRAINT ck_workload_hours CHECK (
        capacity_hours >= 0 AND planned_hours >= 0 AND actual_hours >= 0
    ),
    CONSTRAINT ck_workload_utilization CHECK (utilization IS NULL OR utilization >= 0)
);
CREATE INDEX ix_workload_date ON workload_snapshots (snapshot_date);
CREATE INDEX ix_workload_employee_date_desc ON workload_snapshots (employee_id, snapshot_date DESC);

CREATE TABLE risk_signals (
    id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id   uuid,
    task_id       uuid,
    kind          varchar(10)  NOT NULL,
    status        varchar(10)  NOT NULL DEFAULT 'ACTIVE',
    detected_date date         NOT NULL DEFAULT CURRENT_DATE,
    details       jsonb        NOT NULL DEFAULT '{}'::jsonb,
    cleared_at    timestamptz,
    created_at    timestamptz  NOT NULL DEFAULT now(),
    updated_at    timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_risk_signals_kind CHECK (kind IN ('OVERLOAD', 'DEADLINE')),
    CONSTRAINT ck_risk_signals_status CHECK (status IN ('ACTIVE', 'CLEARED')),
    CONSTRAINT ck_risk_signals_cleared CHECK (
        (status = 'CLEARED') = (cleared_at IS NOT NULL)
    )
);
CREATE UNIQUE INDEX ux_risk_signals_active_employee
    ON risk_signals (employee_id, detected_date, kind)
    WHERE status = 'ACTIVE' AND employee_id IS NOT NULL;
CREATE UNIQUE INDEX ux_risk_signals_active_task
    ON risk_signals (task_id, detected_date, kind)
    WHERE status = 'ACTIVE' AND task_id IS NOT NULL;
CREATE INDEX ix_risk_signals_status_date ON risk_signals (status, detected_date);

CREATE TABLE audit_log (
    id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    uuid,
    action      varchar(80)  NOT NULL,
    entity_type varchar(80)  NOT NULL,
    entity_id   uuid,
    details     jsonb        NOT NULL DEFAULT '{}'::jsonb,
    occurred_at timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_audit_action CHECK (length(trim(action)) > 0),
    CONSTRAINT ck_audit_entity_type CHECK (length(trim(entity_type)) > 0)
);
CREATE INDEX ix_audit_log_occurred ON audit_log (occurred_at DESC);
CREATE INDEX ix_audit_log_actor ON audit_log (actor_id, occurred_at DESC);
CREATE INDEX ix_audit_log_entity ON audit_log (entity_type, entity_id, occurred_at DESC);

CREATE TRIGGER trg_risk_signals_updated BEFORE UPDATE ON risk_signals
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


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
