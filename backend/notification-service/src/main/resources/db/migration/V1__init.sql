-- Auto-extracted from DATABASE_completed.md
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE recipients (
    employee_id       uuid         PRIMARY KEY, -- employees.id из user_db
    full_name         varchar(200) NOT NULL,
    email             varchar(254),
    telegram_chat_id  bigint,
    preferred_channel varchar(10)  NOT NULL DEFAULT 'IN_APP',
    active            boolean      NOT NULL DEFAULT true,
    updated_at        timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_recipients_channel CHECK (
        preferred_channel IN ('IN_APP', 'TELEGRAM', 'EMAIL')
    )
);
CREATE INDEX ix_recipients_active ON recipients (active);

CREATE TABLE notifications (
    id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id uuid          NOT NULL,
    type         varchar(30)   NOT NULL,
    title        varchar(200)  NOT NULL,
    body         varchar(5000) NOT NULL,
    payload      jsonb         NOT NULL DEFAULT '{}'::jsonb,
    created_at   timestamptz   NOT NULL DEFAULT now(),
    read_at      timestamptz,
    CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_id)
        REFERENCES recipients (employee_id) ON DELETE CASCADE,
    CONSTRAINT ck_notifications_type CHECK (
        type IN (
            'ASSIGNMENT', 'DEADLINE_CHANGED', 'OVERLOAD_RISK',
            'DEADLINE_RISK', 'ABSENCE_DECISION', 'OPTIMIZATION_READY'
        )
    )
);
CREATE INDEX ix_notifications_recipient_created
    ON notifications (recipient_id, created_at DESC);
CREATE INDEX ix_notifications_unread
    ON notifications (recipient_id, created_at DESC) WHERE read_at IS NULL;

CREATE TABLE notification_deliveries (
    id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id uuid         NOT NULL,
    channel         varchar(10)  NOT NULL,
    status          varchar(10)  NOT NULL DEFAULT 'NEW',
    attempts        integer      NOT NULL DEFAULT 0,
    last_error      varchar(2000),
    created_at      timestamptz  NOT NULL DEFAULT now(),
    sent_at         timestamptz,
    updated_at      timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT fk_notification_deliveries_notification FOREIGN KEY (notification_id)
        REFERENCES notifications (id) ON DELETE CASCADE,
    CONSTRAINT ck_notification_deliveries_channel CHECK (
        channel IN ('IN_APP', 'TELEGRAM', 'EMAIL')
    ),
    CONSTRAINT ck_notification_deliveries_status CHECK (
        status IN ('NEW', 'SENT', 'FAILED')
    ),
    CONSTRAINT ck_notification_deliveries_attempts CHECK (attempts >= 0),
    CONSTRAINT ck_notification_deliveries_sent CHECK (
        (status = 'SENT') = (sent_at IS NOT NULL)
    ),
    CONSTRAINT ux_notification_delivery_channel UNIQUE (notification_id, channel)
);
CREATE INDEX ix_notification_deliveries_status
    ON notification_deliveries (status, created_at);

CREATE TRIGGER trg_notification_deliveries_updated BEFORE UPDATE ON notification_deliveries
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS processed_events (
    event_id      uuid         PRIMARY KEY,
    event_type    varchar(120) NOT NULL,
    processed_at  timestamptz  NOT NULL DEFAULT now(),
    consumer_name varchar(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_processed_events_processed_at
    ON processed_events (processed_at);
