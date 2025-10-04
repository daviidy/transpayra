CREATE TABLE "industry" (
	"industry_id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	CONSTRAINT "industry_name_unique" UNIQUE("name"),
	CONSTRAINT "industry_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "job_title" ADD COLUMN "industry_id" bigint;--> statement-breakpoint
ALTER TABLE "job_title" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "job_title" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "job_title" ADD CONSTRAINT "job_title_industry_id_industry_industry_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industry"("industry_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_title" ADD CONSTRAINT "job_title_slug_unique" UNIQUE("slug");