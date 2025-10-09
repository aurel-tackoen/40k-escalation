CREATE TABLE "armies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "armies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"playerId" integer NOT NULL,
	"round" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"totalPoints" integer NOT NULL,
	"units" text NOT NULL,
	"isValid" boolean DEFAULT true NOT NULL,
	"lastModified" date NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leagues" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "leagues_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" text,
	"startDate" date NOT NULL,
	"endDate" date,
	"currentRound" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "matches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"leagueId" integer,
	"round" integer NOT NULL,
	"player1Id" integer NOT NULL,
	"player2Id" integer NOT NULL,
	"player1Points" integer DEFAULT 0 NOT NULL,
	"player2Points" integer DEFAULT 0 NOT NULL,
	"winnerId" integer,
	"mission" varchar(255),
	"datePlayed" date,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rounds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"leagueId" integer NOT NULL,
	"number" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"pointLimit" integer NOT NULL,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "wins" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "losses" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "draws" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "totalPoints" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "armies" ADD CONSTRAINT "armies_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_leagueId_leagues_id_fk" FOREIGN KEY ("leagueId") REFERENCES "public"."leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player1Id_players_id_fk" FOREIGN KEY ("player1Id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player2Id_players_id_fk" FOREIGN KEY ("player2Id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winnerId_players_id_fk" FOREIGN KEY ("winnerId") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_leagueId_leagues_id_fk" FOREIGN KEY ("leagueId") REFERENCES "public"."leagues"("id") ON DELETE no action ON UPDATE no action;