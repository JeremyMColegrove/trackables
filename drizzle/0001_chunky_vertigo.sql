DROP INDEX "trackable_items_status_idx";--> statement-breakpoint
ALTER TABLE "trackable_items" DROP COLUMN "status";--> statement-breakpoint
DROP TYPE "public"."trackable_item_status";
