CREATE INDEX "idx_disaster_submitted_by" ON "disaster_cases" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "idx_disaster_status" ON "disaster_cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_disaster_created_at" ON "disaster_cases" USING btree ("created_at");