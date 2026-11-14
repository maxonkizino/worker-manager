-- Auto-extracted from DATABASE_completed.md
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE optimization_proposals (
    id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id     uuid         NOT NULL, -- projects.id из task_db
    status         varchar(10)  NOT NULL DEFAULT 'NEW',
    requested_by   uuid         NOT NULL,
    requested_at   timestamptz  NOT NULL DEFAULT now(),
    applied_at     timestamptz,
    rejected_at    timestamptz,
    input_snapshot jsonb        NOT NULL DEFAULT '{}'::jsonb,
    created_at     timestamptz  NOT NULL DEFAULT now(),
    updated_at     timestamptz  NOT NULL DEFAULT now(),
    version        bigint       NOT NULL DEFAULT 0,
    CONSTRAINT ck_optimization_proposals_status CHECK (
        status IN ('NEW', 'APPLIED', 'REJECTED', 'OUTDATED')
    ),
    CONSTRAINT ck_optimization_proposals_dates CHECK (
        (status = 'APPLIED') = (applied_at IS NOT NULL)
    )
);
CREATE INDEX ix_optimization_proposals_project ON optimization_proposals (project_id, requested_at DESC);
CREATE INDEX ix_optimization_proposals_status ON optimization_proposals (status, requested_at DESC);

CREATE TABLE optimization_variants (
    id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id     uuid          NOT NULL,
    kind            varchar(20)   NOT NULL,
    objective_score numeric(14,4) NOT NULL,
    selected        boolean       NOT NULL DEFAULT false,
    metrics         jsonb         NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz   NOT NULL DEFAULT now(),
    CONSTRAINT fk_optimization_variants_proposal FOREIGN KEY (proposal_id)
        REFERENCES optimization_proposals (id) ON DELETE CASCADE,
    CONSTRAINT ck_optimization_variants_kind CHECK (
        kind IN ('GREEDY', 'LOCAL_SEARCH', 'ALT_WEIGHTS')
    )
);
CREATE INDEX ix_optimization_variants_proposal ON optimization_variants (proposal_id);
CREATE UNIQUE INDEX ux_optimization_variants_selected
    ON optimization_variants (proposal_id) WHERE selected = true;

CREATE TABLE variant_items (
    id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id    uuid          NOT NULL,
    task_id       uuid          NOT NULL, -- tasks.id из task_db
    employee_id   uuid          NOT NULL, -- employees.id из user_db
    planned_hours numeric(8,2)  NOT NULL,
    reason_code   varchar(30)   NOT NULL,
    explanation   varchar(1000),
    CONSTRAINT fk_variant_items_variant FOREIGN KEY (variant_id)
        REFERENCES optimization_variants (id) ON DELETE CASCADE,
    CONSTRAINT ck_variant_items_hours CHECK (planned_hours > 0),
    CONSTRAINT ck_variant_items_reason CHECK (
        reason_code IN (
            'INITIAL_ASSIGNMENT', 'SKILL_MATCH', 'REDUCE_OVERLOAD',
            'REDUCE_DELAY_RISK', 'BALANCE_LOAD'
        )
    ),
    CONSTRAINT ux_variant_items_task UNIQUE (variant_id, task_id)
);
CREATE INDEX ix_variant_items_employee ON variant_items (employee_id);

CREATE TABLE variant_unassigned_tasks (
    id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id  uuid         NOT NULL,
    task_id     uuid         NOT NULL, -- tasks.id из task_db
    reason_code varchar(30)  NOT NULL,
    explanation varchar(1000),
    CONSTRAINT fk_variant_unassigned_variant FOREIGN KEY (variant_id)
        REFERENCES optimization_variants (id) ON DELETE CASCADE,
    CONSTRAINT ck_variant_unassigned_reason CHECK (
        reason_code IN ('NO_ELIGIBLE_EMPLOYEE', 'NO_CAPACITY', 'DEPENDENCY_BLOCKED')
    ),
    CONSTRAINT ux_variant_unassigned_task UNIQUE (variant_id, task_id)
);
CREATE INDEX ix_variant_unassigned_task ON variant_unassigned_tasks (task_id);

CREATE TRIGGER trg_optimization_proposals_updated BEFORE UPDATE ON optimization_proposals
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
