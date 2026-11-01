-- ============================================================
-- MIGRATION 003: Full Database Schema (Fresh Install)
-- 
-- Menghapus database lama & membuat database + semua tabel baru
-- dari seluruh entity TypeORM yang ada di project.
--
-- Menjalankan: 
--   1. Buka phpMyAdmin (http://localhost/phpmyadmin)
--   2. Pilih tab "SQL"
--   3. Copy-paste script ini, lalu klik "Go"
-- ============================================================

-- Hapus database lama jika ada
DROP DATABASE IF EXISTS `logistics_db`;

-- Buat database baru
CREATE DATABASE `logistics_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `logistics_db`;

-- ===================== 1. users =====================
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `refreshToken` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== 2. customers =====================
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_customers_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== 3. drivers =====================
CREATE TABLE IF NOT EXISTS `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `licenseNumber` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'AVAILABLE',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_drivers_licenseNumber` (`licenseNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== 4. vehicles =====================
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plateNumber` varchar(255) NOT NULL,
  `model` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `capacity` int NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_vehicles_plateNumber` (`plateNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== 5. shipments =====================
CREATE TABLE IF NOT EXISTS `shipments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shipmentNumber` varchar(255) NOT NULL,
  `customerId` int NOT NULL,
  `driverId` int DEFAULT NULL,
  `vehicleId` int DEFAULT NULL,
  `originAddress` varchar(255) NOT NULL,
  `destinationAddress` varchar(255) NOT NULL,
  `originLatitude` decimal(10,7) NOT NULL,
  `originLongitude` decimal(10,7) NOT NULL,
  `destinationLatitude` decimal(10,7) NOT NULL,
  `destinationLongitude` decimal(10,7) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'PENDING',
  `estimatedDelivery` datetime DEFAULT NULL,
  `actualDelivery` datetime DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_shipments_shipmentNumber` (`shipmentNumber`),
  KEY `FK_shipments_customer` (`customerId`),
  KEY `FK_shipments_driver` (`driverId`),
  KEY `FK_shipments_vehicle` (`vehicleId`),
  CONSTRAINT `FK_shipments_customer` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_shipments_driver` FOREIGN KEY (`driverId`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_shipments_vehicle` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== 6. tracking =====================
CREATE TABLE IF NOT EXISTS `tracking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shipmentId` int NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `speed` decimal(10,3) DEFAULT NULL,
  `heading` decimal(10,3) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_tracking_shipment` (`shipmentId`),
  CONSTRAINT `FK_tracking_shipment` FOREIGN KEY (`shipmentId`) REFERENCES `shipments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== 7. delivery_history =====================
CREATE TABLE IF NOT EXISTS `delivery_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shipmentId` int NOT NULL,
  `status` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `timestamp` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_delivery_history_shipment` (`shipmentId`),
  CONSTRAINT `FK_delivery_history_shipment` FOREIGN KEY (`shipmentId`) REFERENCES `shipments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== 8. warehouses =====================
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'ACTIVE',
  `totalCapacity` int NOT NULL DEFAULT 0,
  `managerName` varchar(255) NOT NULL,
  `managerPhone` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== 9. warehouse_inventory =====================
CREATE TABLE IF NOT EXISTS `warehouse_inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `warehouseId` int NOT NULL,
  `sku` varchar(255) NOT NULL,
  `productName` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT 0,
  `minStockLevel` int NOT NULL DEFAULT 0,
  `barcodeValue` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_warehouse_inventory_warehouse` (`warehouseId`),
  CONSTRAINT `FK_warehouse_inventory_warehouse` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== 10. sla_policies =====================
CREATE TABLE IF NOT EXISTS `sla_policies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `maxDeliveryHours` int NOT NULL,
  `warningThresholdPercent` int NOT NULL DEFAULT 80,
  `status` varchar(255) NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== 11. fraud_alerts =====================
CREATE TABLE IF NOT EXISTS `fraud_alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shipmentId` int NOT NULL,
  `ruleTriggered` varchar(255) NOT NULL,
  `severity` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `metadata` json DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'OPEN',
  `detectedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_fraud_alerts_shipment` (`shipmentId`),
  CONSTRAINT `FK_fraud_alerts_shipment` FOREIGN KEY (`shipmentId`) REFERENCES `shipments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== 12. iot_devices =====================
CREATE TABLE IF NOT EXISTS `iot_devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deviceId` varchar(255) NOT NULL,
  `imei` varchar(255) NOT NULL,
  `vehicleId` int DEFAULT NULL,
  `driverId` int DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'ACTIVE',
  `firmwareVersion` varchar(255) DEFAULT NULL,
  `lastLatitude` decimal(10,7) DEFAULT NULL,
  `lastLongitude` decimal(10,7) DEFAULT NULL,
  `batteryLevel` decimal(6,2) DEFAULT NULL,
  `signalStrength` decimal(6,2) DEFAULT NULL,
  `lastSeenAt` datetime DEFAULT NULL,
  `reportIntervalSecs` int NOT NULL DEFAULT 30,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_iot_devices_deviceId` (`deviceId`),
  UNIQUE KEY `UQ_iot_devices_imei` (`imei`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== DATA SEED (Opsional) =====================

-- Default Admin User (password: admin123 — hash bcrypt)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `isActive`, `refreshToken`) VALUES
(1, 'Admin', 'admin@logistics.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmF1WGsH7xV0n3t3R5iC', '08123456789', 'ADMIN', 1, NULL)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Default SLA Policy
INSERT INTO `sla_policies` (`id`, `name`, `maxDeliveryHours`, `warningThresholdPercent`, `status`) VALUES
(1, 'Standard', 48, 80, 'ACTIVE'),
(2, 'Express', 24, 75, 'ACTIVE'),
(3, 'Same Day', 6, 70, 'ACTIVE')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ===================== VERIFIKASI =====================
SELECT 'DATABASE DAN TABEL BERHASIL DIBUAT!' AS `STATUS`;
SELECT TABLE_NAME AS `Tabel`, TABLE_ROWS AS `Baris`
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'logistics_db'
ORDER BY TABLE_NAME;
