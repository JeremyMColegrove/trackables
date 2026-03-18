ALTER TABLE "api_keys" ADD COLUMN "project_id" uuid;
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_trackable_items_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."trackable_items"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "api_keys_project_idx" ON "api_keys" USING btree ("project_id");
