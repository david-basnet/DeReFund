CREATE TABLE "email_auth_codes" (
	"auth_code_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"purpose" varchar(40) NOT NULL,
	"code_hash" text NOT NULL,
	"payload" text,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "donations" ALTER COLUMN "donor_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "escrow_milestone_id" integer;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "proof_url" text;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "proof_tx_hash" varchar(100);--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "proof_submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "release_tx_hash" varchar(100);--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "released_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "idx_email_auth_codes_email_purpose" ON "email_auth_codes" USING btree ("email","purpose");
