UPDATE "fixed_schedules"
SET
  "start_time" = LPAD((regexp_match("time_range", '^(\d{1,2})[~-](\d{1,2})$'))[1], 2, '0') || ':00',
  "end_time" = LPAD((regexp_match("time_range", '^(\d{1,2})[~-](\d{1,2})$'))[2], 2, '0') || ':00'
WHERE "time_range" ~ '^\d{1,2}[~-]\d{1,2}$';--> statement-breakpoint
ALTER TABLE "fixed_schedules" DROP COLUMN "time_range";