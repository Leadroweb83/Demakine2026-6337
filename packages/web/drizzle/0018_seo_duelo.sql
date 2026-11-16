CREATE TABLE "seo_competitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_duels" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text DEFAULT 'em-andamento' NOT NULL,
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"result" jsonb
);
--> statement-breakpoint
ALTER TABLE "seo_competitors" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "seo_duels" ENABLE ROW LEVEL SECURITY;
