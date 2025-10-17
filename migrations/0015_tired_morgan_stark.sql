ALTER TABLE "matches" RENAME COLUMN "player1Points" TO "player1_points";--> statement-breakpoint
ALTER TABLE "matches" RENAME COLUMN "player2Points" TO "player2_points";--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "match_type" varchar(50) DEFAULT 'victory_points' NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "game_system_id" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "player1_army_value" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "player2_army_value" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "player1_casualties_value" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "player2_casualties_value" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "margin_of_victory" varchar(50);--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "scenario_objective" text;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "player1_objective_completed" boolean;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "player2_objective_completed" boolean;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "additional_data" text;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_game_system_id_game_systems_id_fk" FOREIGN KEY ("game_system_id") REFERENCES "public"."game_systems"("id") ON DELETE no action ON UPDATE no action;