-- Auto-extracted from DATABASE_completed.md
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
    id                    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    username              varchar(64)  NOT NULL,
    email                 varchar(254) NOT NULL,
    password_hash         varchar(100) NOT NULL,                 -- BCrypt, 60 символов
    status                varchar(10)  NOT NULL DEFAULT 'ACTIVE',
    failed_login_attempts integer      NOT NULL DEFAULT 0,
    locked_until          timestamptz,
    last_login_at         timestamptz,
    created_at            timestamptz  NOT NULL DEFAULT now(),
    updated_at            timestamptz  NOT NULL DEFAULT now(),
    version               bigint       NOT NULL DEFAULT 0,
    CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE', 'BLOCKED')),
    CONSTRAINT ck_users_failed CHECK (failed_login_attempts >= 0)
);
CREATE UNIQUE INDEX ux_users_username ON users (lower(username));
CREATE UNIQUE INDEX ux_users_email    ON users (lower(email));

CREATE TABLE user_roles (
    user_id uuid        NOT NULL,
    role    varchar(20) NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_user_roles_role CHECK (role IN ('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'))
);

CREATE TABLE refresh_tokens (
    id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        uuid        NOT NULL,
    token_hash     varchar(64) NOT NULL,                        -- SHA-256 в hex; сам токен не хранится
    issued_at      timestamptz NOT NULL DEFAULT now(),
    expires_at     timestamptz NOT NULL,
    revoked        boolean     NOT NULL DEFAULT false,
    revoked_at     timestamptz,
    replaced_by_id uuid,                                         -- цепочка ротации
    user_agent     varchar(255),
    ip_address     varchar(45),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_refresh_tokens_replaced FOREIGN KEY (replaced_by_id) REFERENCES refresh_tokens (id) ON DELETE SET NULL,
    CONSTRAINT ck_refresh_tokens_expiry CHECK (expires_at > issued_at),
    CONSTRAINT ck_refresh_tokens_revoked CHECK (revoked = (revoked_at IS NOT NULL))
);
CREATE UNIQUE INDEX ux_refresh_tokens_hash ON refresh_tokens (token_hash);
CREATE INDEX ix_refresh_tokens_user    ON refresh_tokens (user_id);
CREATE INDEX ix_refresh_tokens_expires ON refresh_tokens (expires_at);   -- очистка просроченных

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
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
