CREATE TABLE "seo_fix_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"metric" text NOT NULL,
	"status" text DEFAULT 'aplicando' NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "seo_fix_batches_one_running" ON "seo_fix_batches" USING btree ("status") WHERE status = 'aplicando';--> statement-breakpoint
ALTER TABLE "seo_fix_batches" ENABLE ROW LEVEL SECURITY;
