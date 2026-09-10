ALTER TABLE "achievements" ADD COLUMN "links" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
UPDATE "achievements" SET "links" = ARRAY["link"] WHERE "link" IS NOT NULL AND "link" != '';