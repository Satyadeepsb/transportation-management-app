import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentResolver } from './shipment.resolver';

@Module({
  providers: [ShipmentResolver, ShipmentService],
  exports: [ShipmentService],
})
export class ShipmentModule {}
