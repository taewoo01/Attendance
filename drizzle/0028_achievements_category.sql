ALTER TABLE "achievements" ADD COLUMN "category" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "paper_type" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "awarded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "award_name" text DEFAULT '' NOT NULL;