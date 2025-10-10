ALTER TABLE "translation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "translation" CASCADE;--> statement-breakpoint
ALTER TABLE "salary_submission" ADD COLUMN "user_token_hash" text;--> statement-breakpoint
CREATE INDEX "salary_submission_user_token_hash_index" ON "salary_submission" USING btree ("user_token_hash");