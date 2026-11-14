ALTER TABLE users ADD COLUMN full_name varchar(200);

UPDATE users u
SET full_name = o.payload->>'fullName'
FROM outbox_events o
WHERE o.aggregate_id = u.id
  AND o.event_type = 'user.created'
  AND o.payload->>'fullName' IS NOT NULL
  AND o.payload->>'fullName' <> '';

UPDATE users
SET full_name = username
WHERE full_name IS NULL OR btrim(full_name) = '';

ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
