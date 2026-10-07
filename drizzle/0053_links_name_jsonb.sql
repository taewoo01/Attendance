ALTER TABLE "achievements" ADD COLUMN "links_tmp" jsonb;--> statement-breakpoint
UPDATE "achievements" SET "links_tmp" = coalesce(
  (SELECT jsonb_agg(jsonb_build_object('name', '', 'url', u)) FROM unnest("links") AS u),
  '[]'::jsonb
);--> statement-breakpoint
ALTER TABLE "achievements" DROP COLUMN "links";--> statement-breakpoint
ALTER TABLE "achievements" RENAME COLUMN "links_tmp" TO "links";--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "links" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "links" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "ideas" ADD COLUMN "links_tmp" jsonb;--> statement-breakpoint
UPDATE "ideas" SET "links_tmp" = coalesce(
  (SELECT jsonb_agg(jsonb_build_object('name', '', 'url', u)) FROM unnest("links") AS u),
  '[]'::jsonb
);--> statement-breakpoint
ALTER TABLE "ideas" DROP COLUMN "links";--> statement-breakpoint
ALTER TABLE "ideas" RENAME COLUMN "links_tmp" TO "links";--> statement-breakpoint
ALTER TABLE "ideas" ALTER COLUMN "links" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ideas" ALTER COLUMN "links" SET DEFAULT '[]'::jsonb;
