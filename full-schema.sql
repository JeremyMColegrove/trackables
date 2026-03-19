CREATE TYPE "public"."api_key_status" AS ENUM('active', 'revoked');
CREATE TYPE "public"."trackable_access_role" AS ENUM('submit', 'view', 'manage');
CREATE TYPE "public"."trackable_access_subject_type" AS ENUM('user', 'email');
CREATE TYPE "public"."trackable_form_field_kind" AS ENUM('rating', 'checkboxes', 'notes', 'short_text');
CREATE TYPE "public"."trackable_form_status" AS ENUM('draft', 'published', 'archived');
CREATE TYPE "public"."trackable_kind" AS ENUM('survey', 'api_ingestion');
CREATE TYPE "public"."trackable_submission_source" AS ENUM('public_link', 'user_grant', 'email_grant');
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"project_id" uuid,
	"name" text NOT NULL,
	"key_prefix" text NOT NULL,
	"secret_hash" text NOT NULL,
	"last_four" text NOT NULL,
	"status" "api_key_status" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "trackable_api_usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trackable_id" uuid NOT NULL,
	"api_key_id" uuid NOT NULL,
	"request_id" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"payload" jsonb NOT NULL,
	"metadata" text
);

CREATE TABLE "workspace_team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"member_user_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "trackable_access_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trackable_id" uuid NOT NULL,
	"subject_type" "trackable_access_subject_type" NOT NULL,
	"subject_user_id" text,
	"subject_email" text,
	"role" "trackable_access_role" DEFAULT 'submit' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trackable_access_grants_subject_check" CHECK ((
        "trackable_access_grants"."subject_type" = 'user'
        and "trackable_access_grants"."subject_user_id" is not null
        and "trackable_access_grants"."subject_email" is null
      ) or (
        "trackable_access_grants"."subject_type" = 'email'
        and "trackable_access_grants"."subject_user_id" is null
        and "trackable_access_grants"."subject_email" is not null
      ))
);

CREATE TABLE "trackable_form_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "trackable_form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"key" text NOT NULL,
	"kind" "trackable_form_field_kind" NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"required" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"config" jsonb NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "trackable_form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trackable_id" uuid NOT NULL,
	"form_id" uuid NOT NULL,
	"share_link_id" uuid,
	"submitted_by_user_id" text,
	"submitted_email" text,
	"source" "trackable_submission_source" NOT NULL,
	"submission_snapshot" jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "trackable_forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trackable_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "trackable_form_status" DEFAULT 'draft' NOT NULL,
	"submit_label" text,
	"success_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "trackable_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"kind" "trackable_kind" NOT NULL,
	"active_form_id" uuid,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"submission_count" integer DEFAULT 0 NOT NULL,
	"api_usage_count" integer DEFAULT 0 NOT NULL,
	"last_submission_at" timestamp with time zone,
	"last_api_usage_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "trackable_share_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trackable_id" uuid NOT NULL,
	"token" text NOT NULL,
	"role" "trackable_access_role" DEFAULT 'submit' NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_by_user_id" text NOT NULL,
	"last_used_at" timestamp with time zone,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"primary_email" text NOT NULL,
	"display_name" text,
	"image_url" text,
	"is_profile_private" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_trackable_items_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."trackable_items"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_api_usage_events" ADD CONSTRAINT "trackable_api_usage_events_trackable_id_trackable_items_id_fk" FOREIGN KEY ("trackable_id") REFERENCES "public"."trackable_items"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_api_usage_events" ADD CONSTRAINT "trackable_api_usage_events_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "workspace_team_members" ADD CONSTRAINT "workspace_team_members_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "workspace_team_members" ADD CONSTRAINT "workspace_team_members_member_user_id_users_id_fk" FOREIGN KEY ("member_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "workspace_team_members" ADD CONSTRAINT "workspace_team_members_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_access_grants" ADD CONSTRAINT "trackable_access_grants_trackable_id_trackable_items_id_fk" FOREIGN KEY ("trackable_id") REFERENCES "public"."trackable_items"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_access_grants" ADD CONSTRAINT "trackable_access_grants_subject_user_id_users_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_access_grants" ADD CONSTRAINT "trackable_access_grants_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_form_answers" ADD CONSTRAINT "trackable_form_answers_submission_id_trackable_form_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."trackable_form_submissions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_form_answers" ADD CONSTRAINT "trackable_form_answers_field_id_trackable_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."trackable_form_fields"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_form_fields" ADD CONSTRAINT "trackable_form_fields_form_id_trackable_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."trackable_forms"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_form_submissions" ADD CONSTRAINT "trackable_form_submissions_trackable_id_trackable_items_id_fk" FOREIGN KEY ("trackable_id") REFERENCES "public"."trackable_items"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_form_submissions" ADD CONSTRAINT "trackable_form_submissions_form_id_trackable_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."trackable_forms"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_form_submissions" ADD CONSTRAINT "trackable_form_submissions_share_link_id_trackable_share_links_id_fk" FOREIGN KEY ("share_link_id") REFERENCES "public"."trackable_share_links"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "trackable_form_submissions" ADD CONSTRAINT "trackable_form_submissions_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "trackable_forms" ADD CONSTRAINT "trackable_forms_trackable_id_trackable_items_id_fk" FOREIGN KEY ("trackable_id") REFERENCES "public"."trackable_items"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_items" ADD CONSTRAINT "trackable_items_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_items" ADD CONSTRAINT "trackable_items_active_form_id_trackable_forms_id_fk" FOREIGN KEY ("active_form_id") REFERENCES "public"."trackable_forms"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "trackable_share_links" ADD CONSTRAINT "trackable_share_links_trackable_id_trackable_items_id_fk" FOREIGN KEY ("trackable_id") REFERENCES "public"."trackable_items"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trackable_share_links" ADD CONSTRAINT "trackable_share_links_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "api_keys_key_prefix_idx" ON "api_keys" USING btree ("key_prefix");
CREATE INDEX "api_keys_owner_idx" ON "api_keys" USING btree ("owner_id");
CREATE INDEX "api_keys_project_idx" ON "api_keys" USING btree ("project_id");
CREATE INDEX "api_keys_status_idx" ON "api_keys" USING btree ("status");
CREATE UNIQUE INDEX "trackable_api_usage_events_request_id_idx" ON "trackable_api_usage_events" USING btree ("request_id");
CREATE INDEX "trackable_api_usage_events_trackable_occurred_idx" ON "trackable_api_usage_events" USING btree ("trackable_id","occurred_at");
CREATE INDEX "trackable_api_usage_events_api_key_occurred_idx" ON "trackable_api_usage_events" USING btree ("api_key_id","occurred_at");
CREATE INDEX "workspace_team_members_owner_idx" ON "workspace_team_members" USING btree ("owner_id");
CREATE INDEX "workspace_team_members_member_idx" ON "workspace_team_members" USING btree ("member_user_id");
CREATE UNIQUE INDEX "workspace_team_members_owner_member_idx" ON "workspace_team_members" USING btree ("owner_id","member_user_id") WHERE "workspace_team_members"."revoked_at" is null;
CREATE INDEX "trackable_access_grants_trackable_idx" ON "trackable_access_grants" USING btree ("trackable_id");
CREATE UNIQUE INDEX "trackable_access_grants_trackable_user_idx" ON "trackable_access_grants" USING btree ("trackable_id","subject_user_id") WHERE "trackable_access_grants"."subject_user_id" is not null;
CREATE UNIQUE INDEX "trackable_access_grants_trackable_email_idx" ON "trackable_access_grants" USING btree ("trackable_id","subject_email") WHERE "trackable_access_grants"."subject_email" is not null;
CREATE UNIQUE INDEX "trackable_form_answers_submission_field_idx" ON "trackable_form_answers" USING btree ("submission_id","field_id");
CREATE INDEX "trackable_form_answers_submission_idx" ON "trackable_form_answers" USING btree ("submission_id");
CREATE UNIQUE INDEX "trackable_form_fields_form_key_idx" ON "trackable_form_fields" USING btree ("form_id","key");
CREATE UNIQUE INDEX "trackable_form_fields_form_position_idx" ON "trackable_form_fields" USING btree ("form_id","position");
CREATE INDEX "trackable_form_fields_form_idx" ON "trackable_form_fields" USING btree ("form_id");
CREATE INDEX "trackable_form_submissions_trackable_idx" ON "trackable_form_submissions" USING btree ("trackable_id");
CREATE INDEX "trackable_form_submissions_form_idx" ON "trackable_form_submissions" USING btree ("form_id");
CREATE INDEX "trackable_form_submissions_created_at_idx" ON "trackable_form_submissions" USING btree ("created_at");
CREATE UNIQUE INDEX "trackable_forms_trackable_version_idx" ON "trackable_forms" USING btree ("trackable_id","version");
CREATE INDEX "trackable_forms_trackable_idx" ON "trackable_forms" USING btree ("trackable_id");
CREATE UNIQUE INDEX "trackable_items_owner_slug_idx" ON "trackable_items" USING btree ("owner_id","slug");
CREATE INDEX "trackable_items_owner_idx" ON "trackable_items" USING btree ("owner_id");
CREATE UNIQUE INDEX "trackable_share_links_token_idx" ON "trackable_share_links" USING btree ("token");
CREATE INDEX "trackable_share_links_trackable_idx" ON "trackable_share_links" USING btree ("trackable_id");
CREATE UNIQUE INDEX "users_primary_email_idx" ON "users" USING btree ("primary_email");
