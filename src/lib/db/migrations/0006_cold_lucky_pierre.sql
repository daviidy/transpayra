ALTER TABLE "salary_submission" ADD COLUMN "currency" text DEFAULT 'XOF' NOT NULL;--> statement-breakpoint
ALTER TABLE "company" DROP COLUMN "industry";