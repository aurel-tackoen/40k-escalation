ALTER TABLE "leagues" ADD COLUMN "isPrivate" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "leagues" ADD COLUMN "inviteCode" varchar(10);--> statement-breakpoint
ALTER TABLE "leagues" ADD COLUMN "shareToken" varchar(32);--> statement-breakpoint
ALTER TABLE "leagues" ADD COLUMN "allowDirectJoin" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "leagues" DROP COLUMN "isPublic";--> statement-breakpoint
ALTER TABLE "leagues" DROP COLUMN "joinPassword";--> statement-breakpoint
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_inviteCode_unique" UNIQUE("inviteCode");--> statement-breakpoint
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_shareToken_unique" UNIQUE("shareToken");