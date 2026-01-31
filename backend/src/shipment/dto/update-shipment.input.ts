import { InputType, Field, Float, PartialType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { ShipmentStatus, VehicleType } from '@prisma/client';

@InputType()
export class UpdateShipmentInput {
  @Field()
  @IsString()
  id: string;

  @Field(() => ShipmentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  // Shipper Information
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shipperName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shipperPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shipperAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shipperCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shipperState?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shipperZip?: string;

  // Consignee Information
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  consigneeName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  consigneePhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  consigneeAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  consigneeCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  consigneeState?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  consigneeZip?: string;

  // Cargo Details
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cargoDescription?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @Field(() => VehicleType, { nullable: true })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  // Financial
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualRate?: number;

  // Dates
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;

  // Assignment
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  driverId?: string;

  // Metadata
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
