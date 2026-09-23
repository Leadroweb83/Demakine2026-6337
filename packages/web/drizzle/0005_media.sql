CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"url" text NOT NULL,
	"name" text NOT NULL,
	"alt" text,
	"width" integer,
	"height" integer,
	"size" integer,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_key_unique" UNIQUE("key")
);
