CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"avatar" text DEFAULT '' NOT NULL,
	"team" boolean DEFAULT false NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"who" text DEFAULT '' NOT NULL,
	"file" text DEFAULT '' NOT NULL,
	"result_date" text DEFAULT '' NOT NULL,
	"metric_label" text DEFAULT '' NOT NULL,
	"metric_value" text DEFAULT '' NOT NULL
);
