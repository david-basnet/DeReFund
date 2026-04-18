CREATE TYPE "public"."notification_type" AS ENUM('INFO', 'WARNING', 'SUCCESS', 'ERROR');--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" DEFAULT 'INFO' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"link" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;