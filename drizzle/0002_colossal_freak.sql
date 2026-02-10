ALTER TABLE "post_trip_surveys" ALTER COLUMN "start_reading" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "survey_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "bookings_start_time_idx" ON "bookings" USING btree ("start_time");