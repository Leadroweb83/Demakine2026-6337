CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"city" text,
	"linkedin" text,
	"salary_expectation" text,
	"message" text,
	"resume_key" text,
	"status" text DEFAULT 'recebido' NOT NULL,
	"notes" text,
	"consent_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"area" text NOT NULL,
	"type" text DEFAULT 'efetivo' NOT NULL,
	"location" text DEFAULT 'Limeira/SP' NOT NULL,
	"summary" text NOT NULL,
	"description" text,
	"requirements" text,
	"benefits" text,
	"salary" text,
	"show_salary" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'aberta' NOT NULL,
	"deadline" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_job_idx" ON "applications" USING btree ("job_id");