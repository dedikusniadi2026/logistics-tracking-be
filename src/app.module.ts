import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { DeliveryHistoryModule } from './modules/delivery-history/delivery-history.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UploadsModule } from './modules/uploads/uploads.module';
// New feature modules
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { RouteOptimizationModule } from './modules/route-optimization/route-optimization.module';
import { SlaModule } from './modules/sla/sla.module';
import { FraudModule } from './modules/fraud/fraud.module';
import { IotModule } from './modules/iot/iot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Core modules
    AuthModule,
    UsersModule,
    CustomersModule,
    DriversModule,
    VehiclesModule,
    ShipmentsModule,
    TrackingModule,
    DeliveryHistoryModule,
    DashboardModule,
    UploadsModule,

    // New feature modules
    WarehouseModule,           // WMS + Barcode/QR + Multi-warehouse
    RouteOptimizationModule,   // AI Route Optimization + Auto Dispatch
    SlaModule,                 // SLA Monitoring
    FraudModule,               // Fraud Detection
    IotModule,                 // IoT Vehicle Tracking

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USERNAME ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'logistics_db',
      autoLoadEntities: true,
      synchronize: false, // jangan pakai synchronize di database yang sudah punya data
      retryAttempts: 10,
      retryDelay: 3000,
    }),
  ],
})
export class AppModule {}
