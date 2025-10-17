ALTER TABLE "game_systems" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "game_systems" ADD COLUMN "match_type" varchar(50) DEFAULT 'victory_points' NOT NULL;--> statement-breakpoint
ALTER TABLE "game_systems" ADD COLUMN "match_config" text;