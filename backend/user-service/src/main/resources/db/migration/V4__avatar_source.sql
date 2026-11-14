ALTER TABLE employee_avatars
    ADD COLUMN original_content_type varchar(64),
    ADD COLUMN original_data bytea,
    ADD COLUMN crop_zoom double precision,
    ADD COLUMN crop_offset_x double precision,
    ADD COLUMN crop_offset_y double precision;

ALTER TABLE employee_avatars
    ADD CONSTRAINT ck_employee_avatars_original_type
        CHECK (original_content_type IS NULL OR original_content_type IN ('image/png', 'image/jpeg', 'image/webp')),
    ADD CONSTRAINT ck_employee_avatars_original_size
        CHECK (original_data IS NULL OR octet_length(original_data) BETWEEN 1 AND 15728640),
    ADD CONSTRAINT ck_employee_avatars_crop_zoom
        CHECK (crop_zoom IS NULL OR (crop_zoom >= 1 AND crop_zoom <= 3));
