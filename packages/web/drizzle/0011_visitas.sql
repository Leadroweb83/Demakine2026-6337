CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"visitor" text NOT NULL,
	"source" text NOT NULL,
	"referrer_host" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"device" text NOT NULL,
	"country" text,
	"region" text,
	"city" text,
	"entry" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "traffic_source" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "landing_path" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_campaign" text;--> statement-breakpoint
CREATE INDEX "page_views_created_idx" ON "page_views" USING btree ("created_at");