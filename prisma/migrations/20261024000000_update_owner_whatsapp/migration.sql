-- Ganti kontak owner SYAD MARKET; format internasional untuk tautan WhatsApp.
ALTER TABLE "StoreSetting"
ALTER COLUMN "whatsapp" SET DEFAULT '6285150335567';

UPDATE "StoreSetting"
SET "whatsapp" = '6285150335567'
WHERE "id" = 1;
