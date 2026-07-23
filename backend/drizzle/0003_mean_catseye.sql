CREATE TABLE "game_results" (
	"game_id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"final_streak" integer NOT NULL,
	"best_streak" integer NOT NULL,
	"correct_guesses" integer NOT NULL,
	"incorrect_guesses" integer NOT NULL,
	"accuracy" integer NOT NULL,
	"max_rounds" integer NOT NULL,
	"won" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "game_results_user_id_idx" ON "game_results" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_results_completed_at_idx" ON "game_results" USING btree ("completed_at");