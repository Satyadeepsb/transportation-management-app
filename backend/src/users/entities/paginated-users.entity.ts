import { ObjectType, Field } from '@nestjs/graphql';
import { UserEntity } from './user.entity';
import { PaginationMeta } from '../../shipment/entities/paginated-shipments.entity';

@ObjectType()
export class PaginatedUsersResponse {
  @Field(() => [UserEntity])
  data: UserEntity[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
