DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'taskflow') THEN
    CREATE ROLE taskflow LOGIN PASSWORD 'taskflow' SUPERUSER;
  ELSE
    ALTER ROLE taskflow WITH LOGIN PASSWORD 'taskflow' SUPERUSER;
  END IF;
END
$$;

SELECT 'CREATE DATABASE auth_db OWNER taskflow'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db')\gexec
SELECT 'CREATE DATABASE user_db OWNER taskflow'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'user_db')\gexec
SELECT 'CREATE DATABASE task_db OWNER taskflow'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'task_db')\gexec
SELECT 'CREATE DATABASE analytics_db OWNER taskflow'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'analytics_db')\gexec
SELECT 'CREATE DATABASE optimization_db OWNER taskflow'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'optimization_db')\gexec
SELECT 'CREATE DATABASE notification_db OWNER taskflow'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notification_db')\gexec
