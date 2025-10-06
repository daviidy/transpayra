CREATE TABLE "translation" (
	"translation_id" bigserial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" bigint NOT NULL,
	"language_code" text NOT NULL,
	"field_name" text NOT NULL,
	"translated_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "translation_entity_type_entity_id_language_code_field_name_unique" UNIQUE("entity_type","entity_id","language_code","field_name")
);
--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "location" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "location" ADD COLUMN "region" text;--> statement-breakpoint
CREATE INDEX "translation_entity_type_entity_id_index" ON "translation" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "translation_language_code_index" ON "translation" USING btree ("language_code");--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "location" ADD CONSTRAINT "location_slug_unique" UNIQUE("slug");