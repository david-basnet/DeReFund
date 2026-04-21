ALTER TABLE "milestones" ADD COLUMN "escrow_milestone_id" integer;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "proof_url" text;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "proof_tx_hash" varchar(100);--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "proof_submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "release_tx_hash" varchar(100);--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "released_at" timestamp with time zone;
