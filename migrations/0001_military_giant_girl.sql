CREATE TABLE "players" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "players_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"faction" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "players_email_unique" UNIQUE("email")
);
