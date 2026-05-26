-- Migration: add provenance fields to salaries
-- Generated 2026-05-26 to support importing public datasets (SalariosPerú via Wayback)
-- and AI-extracted compensation data, while keeping user-reported salaries the trusted default.
--
-- To apply locally (pre_prod):
--   cd empliq-backend
--   DATABASE_URL=postgresql://empliq:empliq_dev_password@localhost:5432/empliq_pre_prod \
--     npx prisma db push
--
-- To create a formal Prisma migration (recommended before deploying to prod):
--   cd empliq-backend
--   DATABASE_URL=postgresql://empliq:empliq_dev_password@localhost:5432/empliq_pre_prod \
--     npx prisma migrate dev --name add_salary_provenance
--
-- To apply to production (after validation in pre_prod):
--   cd empliq-backend
--   DATABASE_URL=<empliq_prod URL> npx prisma migrate deploy

-- 1) Enum for the source type
CREATE TYPE "salary_source" AS ENUM ('USER_REPORTED', 'AI_EXTRACTED', 'IMPORTED');

-- 2) Add the four columns. All existing rows default to USER_REPORTED — that matches
--    the assumption made when the table was created (anonymous user reports).
ALTER TABLE "salaries"
  ADD COLUMN "source_type"  "salary_source" NOT NULL DEFAULT 'USER_REPORTED',
  ADD COLUMN "source_name"  TEXT,
  ADD COLUMN "source_url"   TEXT,
  ADD COLUMN "extracted_at" TIMESTAMP(3);

-- 3) Index — the stats query filters/aggregates by source_type frequently.
CREATE INDEX "salaries_source_type_idx" ON "salaries"("source_type");
