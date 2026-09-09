-- "auth"."users"는 Supabase Auth가 이미 관리하는 테이블이라 여기서 만들지 않는다.
-- src/db/schema.ts의 authUsers는 FK 타입 참조용 stub일 뿐이다.
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"can_invite" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;