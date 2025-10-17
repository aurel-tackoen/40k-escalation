CREATE TABLE "unit_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_system_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50),
	"display_order" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "unit_types" ADD CONSTRAINT "unit_types_game_system_id_game_systems_id_fk" FOREIGN KEY ("game_system_id") REFERENCES "public"."game_systems"("id") ON DELETE cascade ON UPDATE no action;