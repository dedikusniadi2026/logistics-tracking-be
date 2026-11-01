-- ============================================================
-- Fix: shipments.id bigint → int AUTO_INCREMENT
-- Tabel proof_of_delivery & shipment_tracking adalah legacy,
-- sudah digantikan oleh tracking (TypeORM) dan uploads.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Ubah shipments.id menjadi int AUTO_INCREMENT
-- Cari nilai MAX id dulu agar AUTO_INCREMENT mulai dari sana
ALTER TABLE `shipments`
  MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT;

-- Sesuaikan tabel legacy yang FK ke shipments.id (bigint → int)
ALTER TABLE `proof_of_delivery`
  MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT,
  MODIFY COLUMN `shipment_id` int NOT NULL;

ALTER TABLE `shipment_tracking`
  MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT,
  MODIFY COLUMN `shipment_id` int NOT NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- Verifikasi
SELECT 
  COLUMN_NAME, COLUMN_TYPE, EXTRA
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'logistics_db' 
  AND TABLE_NAME = 'shipments' 
  AND COLUMN_NAME = 'id';
