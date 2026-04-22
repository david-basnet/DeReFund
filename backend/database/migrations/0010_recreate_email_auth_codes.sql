CREATE TABLE IF NOT EXISTS "email_auth_codes" (
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
CREATE INDEX IF NOT EXISTS "idx_email_auth_codes_email_purpose" ON "email_auth_codes" USING btree ("email","purpose");
