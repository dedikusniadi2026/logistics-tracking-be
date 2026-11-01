-- ============================================================
-- Migration: New Feature Tables
-- Run this manually against your logistics_db database
-- ============================================================

-- 1. Warehouses (WMS)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Warehouse Inventory (WMS + Barcode/QR)
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
  CONSTRAINT `FK_warehouse_inventory_warehouse`
    FOREIGN KEY (`warehouseId`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. SLA Policies
CREATE TABLE IF NOT EXISTS `sla_policies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `maxDeliveryHours` int NOT NULL,
  `warningThresholdPercent` int NOT NULL DEFAULT 80,
  `status` varchar(255) NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default SLA policy
INSERT IGNORE INTO `sla_policies` (`id`, `name`, `maxDeliveryHours`, `warningThresholdPercent`, `status`)
VALUES (1, 'Standard', 48, 80, 'ACTIVE');

-- 4. Fraud Alerts
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
  CONSTRAINT `FK_fraud_alerts_shipment`
    FOREIGN KEY (`shipmentId`) REFERENCES `shipments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. IoT Devices
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
