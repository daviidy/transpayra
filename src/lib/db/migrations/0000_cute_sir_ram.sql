CREATE TABLE "company" (
	"company_id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"logo_url" text,
	CONSTRAINT "company_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "job_title" (
	"job_title_id" bigserial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	CONSTRAINT "job_title_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "level" (
	"level_id" bigserial PRIMARY KEY NOT NULL,
	"company_id" bigint NOT NULL,
	"job_title_id" bigint NOT NULL,
	"level_name" text NOT NULL,
	"description" text,
	CONSTRAINT "level_company_id_job_title_id_level_name_unique" UNIQUE("company_id","job_title_id","level_name")
);
--> statement-breakpoint
CREATE TABLE "location" (
	"location_id" bigserial PRIMARY KEY NOT NULL,
	"city" text NOT NULL,
	"state" text,
	"country" text NOT NULL,
	CONSTRAINT "location_city_state_country_unique" UNIQUE("city","state","country")
);
--> statement-breakpoint
CREATE TABLE "salary_submission" (
	"submission_id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"company_id" bigint NOT NULL,
	"job_title_id" bigint NOT NULL,
	"location_id" bigint NOT NULL,
	"level_id" bigint,
	"base_salary" numeric NOT NULL,
	"bonus" numeric DEFAULT '0',
	"stock_compensation" numeric DEFAULT '0',
	"years_of_experience" integer NOT NULL,
	"years_at_company" integer DEFAULT 0,
	"submission_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "level" ADD CONSTRAINT "level_company_id_company_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("company_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level" ADD CONSTRAINT "level_job_title_id_job_title_job_title_id_fk" FOREIGN KEY ("job_title_id") REFERENCES "public"."job_title"("job_title_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_submission" ADD CONSTRAINT "salary_submission_company_id_company_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("company_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_submission" ADD CONSTRAINT "salary_submission_job_title_id_job_title_job_title_id_fk" FOREIGN KEY ("job_title_id") REFERENCES "public"."job_title"("job_title_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_submission" ADD CONSTRAINT "salary_submission_location_id_location_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("location_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_submission" ADD CONSTRAINT "salary_submission_level_id_level_level_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."level"("level_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "level_company_id_job_title_id_index" ON "level" USING btree ("company_id","job_title_id");--> statement-breakpoint
CREATE INDEX "salary_submission_job_title_id_company_id_location_id_level_id_index" ON "salary_submission" USING btree ("job_title_id","company_id","location_id","level_id");