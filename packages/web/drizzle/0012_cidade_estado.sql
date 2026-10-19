ALTER TABLE "applications" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "state" text;
--> statement-breakpoint
-- leads: "Cidade (exterior)" e "Exterior" viram estado Exterior
UPDATE "leads" SET "state" = 'Exterior', "city" = NULLIF(btrim(regexp_replace("city", '\s*\(exterior\)\s*$', '', 'i')), '') WHERE "state" IS NULL AND "city" ~* '\(exterior\)\s*$';--> statement-breakpoint
UPDATE "leads" SET "state" = 'Exterior', "city" = NULL WHERE "state" IS NULL AND btrim("city") ~* '^exterior$';--> statement-breakpoint
-- leads: quem digitou só a sigla no campo cidade
UPDATE "leads" SET "state" = upper(btrim("city")), "city" = NULL WHERE "state" IS NULL AND upper(btrim("city")) IN ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO');--> statement-breakpoint
-- leads: "Limeira / SP", "Limeira - SP", "Limeira, SP", "Limeira SP" viram cidade + estado
WITH parsed AS (
  SELECT "id", regexp_match(btrim("city"), '^(.*?)\s*(?:[/,–-]\s*|\s)([A-Za-z]{2})\.?$') AS m
  FROM "leads" WHERE "state" IS NULL AND "city" IS NOT NULL
)
UPDATE "leads" SET "city" = NULLIF(btrim((parsed.m)[1]), ''), "state" = upper((parsed.m)[2])
FROM parsed
WHERE "leads"."id" = parsed."id" AND parsed.m IS NOT NULL AND upper((parsed.m)[2]) IN ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO');--> statement-breakpoint
-- applications: "Cidade (exterior)" e "Exterior" viram estado Exterior
UPDATE "applications" SET "state" = 'Exterior', "city" = NULLIF(btrim(regexp_replace("city", '\s*\(exterior\)\s*$', '', 'i')), '') WHERE "state" IS NULL AND "city" ~* '\(exterior\)\s*$';--> statement-breakpoint
UPDATE "applications" SET "state" = 'Exterior', "city" = NULL WHERE "state" IS NULL AND btrim("city") ~* '^exterior$';--> statement-breakpoint
-- applications: quem digitou só a sigla no campo cidade
UPDATE "applications" SET "state" = upper(btrim("city")), "city" = NULL WHERE "state" IS NULL AND upper(btrim("city")) IN ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO');--> statement-breakpoint
-- applications: "Limeira / SP", "Limeira - SP", "Limeira, SP", "Limeira SP" viram cidade + estado
WITH parsed AS (
  SELECT "id", regexp_match(btrim("city"), '^(.*?)\s*(?:[/,–-]\s*|\s)([A-Za-z]{2})\.?$') AS m
  FROM "applications" WHERE "state" IS NULL AND "city" IS NOT NULL
)
UPDATE "applications" SET "city" = NULLIF(btrim((parsed.m)[1]), ''), "state" = upper((parsed.m)[2])
FROM parsed
WHERE "applications"."id" = parsed."id" AND parsed.m IS NOT NULL AND upper((parsed.m)[2]) IN ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO');
