-- Auto-extracted from DATABASE_completed.md
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE projects (
    id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        varchar(200) NOT NULL,
    description text,
    manager_id  uuid         NOT NULL, -- employees.id из user_db
    start_date  date         NOT NULL,
    end_date    date,
    status      varchar(10)  NOT NULL DEFAULT 'ACTIVE',
    created_at  timestamptz  NOT NULL DEFAULT now(),
    updated_at  timestamptz  NOT NULL DEFAULT now(),
    version     bigint       NOT NULL DEFAULT 0,
    CONSTRAINT ck_projects_status CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    CONSTRAINT ck_projects_period CHECK (end_date IS NULL OR end_date >= start_date)
);
CREATE INDEX ix_projects_manager ON projects (manager_id);
CREATE INDEX ix_projects_status ON projects (status);
CREATE INDEX ix_projects_name_trgm ON projects USING gin (lower(name) gin_trgm_ops);

CREATE TABLE project_members (
    project_id   uuid        NOT NULL,
    employee_id  uuid        NOT NULL, -- employees.id из user_db
    project_role varchar(20) NOT NULL DEFAULT 'MEMBER',
    joined_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pk_project_members PRIMARY KEY (project_id, employee_id),
    CONSTRAINT fk_project_members_project FOREIGN KEY (project_id)
        REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT ck_project_members_role CHECK (project_role IN ('MANAGER', 'MEMBER'))
);
CREATE INDEX ix_project_members_employee ON project_members (employee_id);

CREATE TABLE tasks (
    id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      uuid          NOT NULL,
    title           varchar(250)  NOT NULL,
    description     text,
    created_by      uuid          NOT NULL, -- users.id / employees.id
    status          varchar(15)   NOT NULL DEFAULT 'CREATED',
    priority        varchar(10)   NOT NULL DEFAULT 'MEDIUM',
    planned_start   date,
    planned_end     date,
    estimated_hours numeric(8,2)  NOT NULL,
    actual_hours    numeric(8,2)  NOT NULL DEFAULT 0,
    created_at      timestamptz   NOT NULL DEFAULT now(),
    updated_at      timestamptz   NOT NULL DEFAULT now(),
    version         bigint        NOT NULL DEFAULT 0,
    CONSTRAINT fk_tasks_project FOREIGN KEY (project_id)
        REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT ck_tasks_status CHECK (status IN ('CREATED', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
    CONSTRAINT ck_tasks_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT ck_tasks_estimated_hours CHECK (estimated_hours > 0),
    CONSTRAINT ck_tasks_actual_hours CHECK (actual_hours >= 0),
    CONSTRAINT ck_tasks_period CHECK (
        planned_start IS NULL OR planned_end IS NULL OR planned_end >= planned_start
    )
);
CREATE INDEX ix_tasks_project_status ON tasks (project_id, status);
CREATE INDEX ix_tasks_planned_end ON tasks (planned_end) WHERE status NOT IN ('DONE', 'CANCELLED');
CREATE INDEX ix_tasks_title_trgm ON tasks USING gin (lower(title) gin_trgm_ops);

CREATE TABLE task_skill_requirements (
    task_id    uuid     NOT NULL,
    skill_id   uuid     NOT NULL, -- skills.id из user_db
    min_level  smallint NOT NULL,
    CONSTRAINT pk_task_skill_requirements PRIMARY KEY (task_id, skill_id),
    CONSTRAINT fk_task_skill_requirements_task FOREIGN KEY (task_id)
        REFERENCES tasks (id) ON DELETE CASCADE,
    CONSTRAINT ck_task_skill_requirements_level CHECK (min_level BETWEEN 0 AND 5)
);
CREATE INDEX ix_task_skill_requirements_skill ON task_skill_requirements (skill_id);

CREATE TABLE task_dependencies (
    task_id            uuid        NOT NULL,
    depends_on_task_id uuid        NOT NULL,
    dependency_type    varchar(20) NOT NULL DEFAULT 'FINISH_TO_START',
    created_at         timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pk_task_dependencies PRIMARY KEY (task_id, depends_on_task_id),
    CONSTRAINT fk_task_dependencies_task FOREIGN KEY (task_id)
        REFERENCES tasks (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_dependencies_parent FOREIGN KEY (depends_on_task_id)
        REFERENCES tasks (id) ON DELETE CASCADE,
    CONSTRAINT ck_task_dependencies_not_self CHECK (task_id <> depends_on_task_id),
    CONSTRAINT ck_task_dependencies_type CHECK (dependency_type IN ('FINISH_TO_START'))
);
CREATE INDEX ix_task_dependencies_parent ON task_dependencies (depends_on_task_id);

CREATE TABLE assignments (
    id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id      uuid          NOT NULL,
    employee_id  uuid          NOT NULL, -- employees.id из user_db
    assigned_by  uuid          NOT NULL, -- users.id / employees.id
    proposal_id  uuid,                    -- optimization_proposals.id из optimization_db
    planned_hours numeric(8,2) NOT NULL,
    status       varchar(12)   NOT NULL DEFAULT 'ACTIVE',
    source       varchar(10)   NOT NULL DEFAULT 'MANUAL',
    assigned_at  timestamptz   NOT NULL DEFAULT now(),
    completed_at timestamptz,
    created_at   timestamptz   NOT NULL DEFAULT now(),
    updated_at   timestamptz   NOT NULL DEFAULT now(),
    version      bigint        NOT NULL DEFAULT 0,
    CONSTRAINT fk_assignments_task FOREIGN KEY (task_id)
        REFERENCES tasks (id) ON DELETE CASCADE,
    CONSTRAINT ck_assignments_hours CHECK (planned_hours > 0),
    CONSTRAINT ck_assignments_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT ck_assignments_source CHECK (source IN ('MANUAL', 'OPTIMIZER')),
    CONSTRAINT ck_assignments_completion CHECK (
        (status = 'COMPLETED') = (completed_at IS NOT NULL)
    )
);
CREATE INDEX ix_assignments_task_status ON assignments (task_id, status);
CREATE INDEX ix_assignments_employee_status ON assignments (employee_id, status);
CREATE INDEX ix_assignments_proposal ON assignments (proposal_id) WHERE proposal_id IS NOT NULL;
CREATE UNIQUE INDEX ux_assignments_one_active_per_task
    ON assignments (task_id) WHERE status = 'ACTIVE';

CREATE TABLE time_entries (
    id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id     uuid          NOT NULL,
    employee_id uuid          NOT NULL, -- employees.id из user_db
    work_date   date          NOT NULL,
    hours       numeric(6,2)  NOT NULL,
    description varchar(1000),
    created_at  timestamptz   NOT NULL DEFAULT now(),
    updated_at  timestamptz   NOT NULL DEFAULT now(),
    version     bigint        NOT NULL DEFAULT 0,
    CONSTRAINT fk_time_entries_task FOREIGN KEY (task_id)
        REFERENCES tasks (id) ON DELETE CASCADE,
    CONSTRAINT ck_time_entries_hours CHECK (hours > 0 AND hours <= 24)
);
CREATE INDEX ix_time_entries_task_date ON time_entries (task_id, work_date);
CREATE INDEX ix_time_entries_employee_date ON time_entries (employee_id, work_date);

CREATE TABLE task_comments (
    id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id    uuid         NOT NULL,
    author_id  uuid         NOT NULL, -- users.id / employees.id
    body       varchar(5000) NOT NULL,
    created_at timestamptz  NOT NULL DEFAULT now(),
    updated_at timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id)
        REFERENCES tasks (id) ON DELETE CASCADE,
    CONSTRAINT ck_task_comments_body CHECK (length(trim(body)) > 0)
);
CREATE INDEX ix_task_comments_task_created ON task_comments (task_id, created_at);

CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_time_entries_updated BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_task_comments_updated BEFORE UPDATE ON task_comments
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
