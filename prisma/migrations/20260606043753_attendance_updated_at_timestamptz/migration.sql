-- Valores existentes foram gravados como instante UTC (timestamp without time zone).
ALTER TABLE "lessons"
ALTER COLUMN "attendance_updated_at" SET DATA TYPE TIMESTAMPTZ(6)
USING "attendance_updated_at" AT TIME ZONE 'UTC';
