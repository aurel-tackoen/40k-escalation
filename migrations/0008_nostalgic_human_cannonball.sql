CREATE TABLE "factions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_system_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_systems" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"short_name" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_systems_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_system_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Insert default Warhammer 40k game system
INSERT INTO "game_systems" ("id", "name", "short_name", "is_active", "created_at") 
VALUES (1, 'Warhammer 40,000', '40k', true, now())
ON CONFLICT (name) DO NOTHING;
--> statement-breakpoint
-- Add column with default value of 1 (Warhammer 40k) for existing leagues
ALTER TABLE "leagues" ADD COLUMN "game_system_id" integer DEFAULT 1;
--> statement-breakpoint
-- Update any existing leagues to have game_system_id = 1
UPDATE "leagues" SET "game_system_id" = 1 WHERE "game_system_id" IS NULL;
--> statement-breakpoint
-- Now make it NOT NULL
ALTER TABLE "leagues" ALTER COLUMN "game_system_id" SET NOT NULL;
--> statement-breakpoint
-- Remove the default so new leagues must specify a game system
ALTER TABLE "leagues" ALTER COLUMN "game_system_id" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "factions" ADD CONSTRAINT "factions_game_system_id_game_systems_id_fk" FOREIGN KEY ("game_system_id") REFERENCES "public"."game_systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_game_system_id_game_systems_id_fk" FOREIGN KEY ("game_system_id") REFERENCES "public"."game_systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_game_system_id_game_systems_id_fk" FOREIGN KEY ("game_system_id") REFERENCES "public"."game_systems"("id") ON DELETE no action ON UPDATE no action;