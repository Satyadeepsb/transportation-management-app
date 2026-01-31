import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { ShipmentStatus, VehicleType } from '@prisma/client';
import { UserEntity } from '../../users/entities/user.entity';

// Register enums for GraphQL
registerEnumType(ShipmentStatus, {
  name: 'ShipmentStatus',
  description: 'Status of the shipment in its lifecycle',
});

registerEnumType(VehicleType, {
  name: 'VehicleType',
  description: 'Type of vehicle required for the shipment',
});

@ObjectType('Shipment')
export class ShipmentEntity {
  @Field(() => ID)
  id: string;

  @Field()
  trackingNumber: string;

  @Field(() => ShipmentStatus)
  status: ShipmentStatus;

  // Shipper Information
  @Field()
  shipperName: string;

  @Field()
  shipperPhone: string;

  @Field({ nullable: true })
  shipperEmail?: string;

  @Field()
  shipperAddress: string;

  @Field()
  shipperCity: string;

  @Field()
  shipperState: string;

  @Field()
  shipperZip: string;

  // Consignee Information
  @Field()
  consigneeName: string;

  @Field()
  consigneePhone: string;

  @Field({ nullable: true })
  consigneeEmail?: string;

  @Field()
  consigneeAddress: string;

  @Field()
  consigneeCity: string;

  @Field()
  consigneeState: string;

  @Field()
  consigneeZip: string;

  // Cargo Details
  @Field()
  cargoDescription: string;

  @Field(() => Float)
  weight: number;

  @Field({ nullable: true })
  dimensions?: string;

  @Field(() => VehicleType)
  vehicleType: VehicleType;

  // Financial
  @Field(() => Float)
  estimatedRate: number;

  @Field(() => Float, { nullable: true })
  actualRate?: number;

  @Field()
  currency: string;

  // Dates
  @Field()
  pickupDate: Date;

  @Field({ nullable: true })
  deliveryDate?: Date;

  @Field()
  estimatedDelivery: Date;

  // Relations
  @Field()
  createdById: string;

  @Field(() => UserEntity, { nullable: true })
  createdBy?: UserEntity;

  @Field({ nullable: true })
  driverId?: string;

  @Field(() => UserEntity, { nullable: true })
  driver?: UserEntity;

  // Metadata
  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
