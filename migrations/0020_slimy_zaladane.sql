CREATE TABLE "league_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "league_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"leagueId" integer NOT NULL,
	"pairing_method" varchar(50) DEFAULT 'swiss' NOT NULL,
	"allow_rematches" boolean DEFAULT false NOT NULL,
	"auto_generate_pairings" boolean DEFAULT false NOT NULL,
	"tiebreak_method" varchar(50) DEFAULT 'points_differential' NOT NULL,
	"playoff_enabled" boolean DEFAULT false NOT NULL,
	"playoff_top_n" integer DEFAULT 4 NOT NULL,
	"allow_mid_league_joins" boolean DEFAULT true NOT NULL,
	"bye_handling" varchar(50) DEFAULT 'auto' NOT NULL,
	"first_round_pairing_method" varchar(50) DEFAULT 'manual' NOT NULL,
	"subsequent_round_method" varchar(50) DEFAULT 'swiss' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "league_settings_leagueId_unique" UNIQUE("leagueId")
);
--> statement-breakpoint
CREATE TABLE "pairings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pairings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"leagueId" integer NOT NULL,
	"round" integer NOT NULL,
	"player1Id" integer NOT NULL,
	"player2Id" integer,
	"match_id" integer,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"is_bye" boolean DEFAULT false NOT NULL,
	"due_date" date,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "joined_round" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "left_round" integer;--> statement-breakpoint
ALTER TABLE "league_settings" ADD CONSTRAINT "league_settings_leagueId_leagues_id_fk" FOREIGN KEY ("leagueId") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pairings" ADD CONSTRAINT "pairings_leagueId_leagues_id_fk" FOREIGN KEY ("leagueId") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pairings" ADD CONSTRAINT "pairings_player1Id_players_id_fk" FOREIGN KEY ("player1Id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pairings" ADD CONSTRAINT "pairings_player2Id_players_id_fk" FOREIGN KEY ("player2Id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;