CREATE TABLE "ptd_signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"timeframe" text,
	"signal_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"logic_type" text,
	"direction" text,
	"confidence" double precision,
	"is_evaluated" boolean DEFAULT false,
	"is_hit" boolean,
	"price_at_signal" double precision,
	"actual_turn_time" timestamp with time zone,
	"error_minutes" double precision
);
--> statement-breakpoint
CREATE INDEX "idx_ptd_signals_symbol" ON "ptd_signals" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "idx_ptd_signals_evaluated" ON "ptd_signals" USING btree ("is_evaluated");