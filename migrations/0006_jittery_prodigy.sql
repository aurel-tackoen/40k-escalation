CREATE TABLE "league_memberships" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "league_memberships_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"leagueId" integer NOT NULL,
	"userId" integer NOT NULL,
	"playerId" integer,
	"role" varchar(50) DEFAULT 'player' NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" DROP CONSTRAINT "players_email_unique";--> statement-breakpoint
ALTER TABLE "armies" DROP CONSTRAINT "armies_playerId_players_id_fk";
--> statement-breakpoint
ALTER TABLE "armies" ADD COLUMN "leagueId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "leagues" ADD COLUMN "createdBy" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "leagues" ADD COLUMN "isPublic" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "leagues" ADD COLUMN "joinPassword" varchar(255);--> statement-breakpoint
ALTER TABLE "leagues" ADD COLUMN "maxPlayers" integer;--> statement-breakpoint
ALTER TABLE "leagues" ADD COLUMN "status" varchar(50) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "leagueId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "league_memberships" ADD CONSTRAINT "league_memberships_leagueId_leagues_id_fk" FOREIGN KEY ("leagueId") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_memberships" ADD CONSTRAINT "league_memberships_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_memberships" ADD CONSTRAINT "league_memberships_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "armies" ADD CONSTRAINT "armies_leagueId_leagues_id_fk" FOREIGN KEY ("leagueId") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "armies" ADD CONSTRAINT "armies_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_leagueId_leagues_id_fk" FOREIGN KEY ("leagueId") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;