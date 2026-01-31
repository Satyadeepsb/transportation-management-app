import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ShipmentEntity } from './shipment.entity';

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}

@ObjectType()
export class PaginatedShipmentsResponse {
  @Field(() => [ShipmentEntity])
  data: ShipmentEntity[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
