ALTER TABLE "trackable_api_usage_events" ALTER COLUMN "metadata" DROP DEFAULT;
ALTER TABLE "trackable_api_usage_events" ALTER COLUMN "metadata" DROP NOT NULL;
ALTER TABLE "trackable_api_usage_events"
ALTER COLUMN "metadata" TYPE text
USING CASE
  WHEN "metadata" = '{}'::jsonb THEN NULL
  ELSE "metadata"::text
END;
