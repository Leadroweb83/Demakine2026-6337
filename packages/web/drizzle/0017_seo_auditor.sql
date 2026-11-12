CREATE TABLE "seo_issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"code" text NOT NULL,
	"severity" text NOT NULL,
	"message" text NOT NULL,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "seo_page_scores" (
	"run_id" integer NOT NULL,
	"path" text NOT NULL,
	"lang" text DEFAULT 'pt' NOT NULL,
	"area" text NOT NULL,
	"seo_score" integer NOT NULL,
	"checks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"facts" jsonb,
	"status_code" integer NOT NULL,
	"indexable" boolean DEFAULT true NOT NULL,
	"inlinks" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "seo_page_scores_run_id_path_pk" PRIMARY KEY("run_id","path")
);
--> statement-breakpoint
CREATE TABLE "seo_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"kind" text DEFAULT 'diaria' NOT NULL,
	"status" text DEFAULT 'em-andamento' NOT NULL,
	"pages_total" integer DEFAULT 0 NOT NULL,
	"pages_audited" integer DEFAULT 0 NOT NULL,
	"cursor" integer DEFAULT 0 NOT NULL,
	"site_seo_score" integer,
	"sector_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"area_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"alerts" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "seo_issues_open_uniq" ON "seo_issues" USING btree ("path","code") WHERE "seo_issues"."resolved_at" is null;--> statement-breakpoint
CREATE INDEX "seo_page_scores_path_run_idx" ON "seo_page_scores" USING btree ("path","run_id");
--> statement-breakpoint
ALTER TABLE "seo_runs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "seo_page_scores" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "seo_issues" ENABLE ROW LEVEL SECURITY;
