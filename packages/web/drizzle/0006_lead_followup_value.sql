ALTER TABLE "leads" ADD COLUMN "next_action_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "next_action_note" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "proposal_value" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "won_at" timestamp with time zone;