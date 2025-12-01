ALTER TABLE "salary_submission" ADD COLUMN "access_expires_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "salary_submission_user_id_index" ON "salary_submission" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "salary_submission_access_expires_at_index" ON "salary_submission" USING btree ("access_expires_at");