CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"window_id" integer NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;
