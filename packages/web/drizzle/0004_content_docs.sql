CREATE TABLE "content_docs" (
	"collection" text NOT NULL,
	"key" text NOT NULL,
	"data" jsonb NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_docs_collection_key_pk" PRIMARY KEY("collection","key")
);
