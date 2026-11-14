-- Default standard work week (Mon–Fri, 8h) and baseline skills
INSERT INTO work_schedules (id, name, type)
VALUES ('a0000000-0000-0000-0000-000000000001', 'STANDARD', 'STANDARD')
ON CONFLICT (name) DO NOTHING;

INSERT INTO work_schedule_days (schedule_id, day_of_week, hours)
SELECT ws.id, d.day_of_week, 8
FROM work_schedules ws
         CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS d(day_of_week)
WHERE ws.name = 'STANDARD'
ON CONFLICT (schedule_id, day_of_week) DO NOTHING;

INSERT INTO skills (name, description)
SELECT v.name, v.description
FROM (VALUES ('Java', 'Java development'),
             ('React', 'React frontend'),
             ('SQL', 'SQL and databases')) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM skills s WHERE lower(s.name) = lower(v.name));
