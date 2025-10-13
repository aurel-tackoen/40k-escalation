ALTER TABLE "painting_progress" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "painting_progress" CASCADE;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "netlifyId" varchar(255);--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "role" varchar(50) DEFAULT 'player' NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "lastLogin" timestamp;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_netlifyId_unique" UNIQUE("netlifyId");