-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "estimate" TEXT,
ADD COLUMN     "guarantee" TEXT;

-- Backfill only empty fields so existing admin edits are never overwritten.
UPDATE "Product"
SET "estimate" = 'Estimasi 1–24 jam setelah pembayaran diverifikasi.'
WHERE "kind" = 'SMM' AND "estimate" IS NULL;

UPDATE "Product"
SET "guarantee" = 'Konfirmasi ketersediaan garansi/refill ke admin sebelum order.'
WHERE "kind" = 'SMM' AND "guarantee" IS NULL;
