import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { ShipmentStatus } from '@prisma/client';

@InputType()
export class ShipmentFilterInput {
  @Field(() => ShipmentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  createdById?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  driverId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shipperCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  consigneeCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string; // Search across multiple fields
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  limit: number = 10;

  @Field({ nullable: true, defaultValue: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @Field({ nullable: true, defaultValue: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
