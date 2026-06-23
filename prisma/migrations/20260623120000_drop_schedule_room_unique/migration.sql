-- Drop room-only uniqueness so the same professor can reuse a room/slot across disciplines.
DROP INDEX IF EXISTS "schedules_room_id_day_of_week_time_slot_id_key";
