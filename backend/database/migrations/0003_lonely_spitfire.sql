ALTER TYPE "public"."disaster_status" ADD VALUE 'DRAFT' BEFORE 'PENDING';--> statement-breakpoint
ALTER TABLE "disaster_cases" ALTER COLUMN "status" SET DEFAULT 'DRAFT';