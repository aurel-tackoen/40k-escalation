CREATE TABLE "painting_progress" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "painting_progress_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"playerId" integer NOT NULL,
	"round" integer NOT NULL,
	"unitName" varchar(255) NOT NULL,
	"totalModels" integer NOT NULL,
	"paintedModels" integer NOT NULL,
	"points" integer NOT NULL,
	"lastUpdated" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "painting_progress" ADD CONSTRAINT "painting_progress_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;