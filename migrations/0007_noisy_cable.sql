ALTER TABLE "players" DROP CONSTRAINT "players_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "email";