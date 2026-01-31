import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsEmail, IsOptional, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { VehicleType } from '@prisma/client';

@InputType()
export class CreateShipmentInput {
  // Shipper Information
  @Field()
  @IsString()
  shipperName: string;

  @Field()
  @IsString()
  shipperPhone: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  shipperEmail?: string;

  @Field()
  @IsString()
  shipperAddress: string;

  @Field()
  @IsString()
  shipperCity: string;

  @Field()
  @IsString()
  shipperState: string;

  @Field()
  @IsString()
  shipperZip: string;

  // Consignee Information
  @Field()
  @IsString()
  consigneeName: string;

  @Field()
  @IsString()
  consigneePhone: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  consigneeEmail?: string;

  @Field()
  @IsString()
  consigneeAddress: string;

  @Field()
  @IsString()
  consigneeCity: string;

  @Field()
  @IsString()
  consigneeState: string;

  @Field()
  @IsString()
  consigneeZip: string;

  // Cargo Details
  @Field()
  @IsString()
  cargoDescription: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  weight: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @Field(() => VehicleType)
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  // Financial
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  estimatedRate: number;

  // Dates
  @Field()
  @IsDateString()
  pickupDate: string;

  @Field()
  @IsDateString()
  estimatedDelivery: string;

  // Optional metadata
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
