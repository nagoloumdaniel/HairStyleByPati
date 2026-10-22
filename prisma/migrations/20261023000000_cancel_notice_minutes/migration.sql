-- Delai d'annulation : passage des heures aux minutes (valeur existante convertie, defaut 30 min).
ALTER TABLE "SalonSettings" RENAME COLUMN "minCancelNoticeHours" TO "minCancelNoticeMinutes";
UPDATE "SalonSettings" SET "minCancelNoticeMinutes" = "minCancelNoticeMinutes" * 60;
ALTER TABLE "SalonSettings" ALTER COLUMN "minCancelNoticeMinutes" SET DEFAULT 30;
