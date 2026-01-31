import { ObjectType, Field, ID, HideField, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

// Register enum for GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role for access control',
  valuesMap: {
    ADMIN: {
      description: 'Full system access',
    },
    DISPATCHER: {
      description: 'Can create and assign shipments',
    },
    DRIVER: {
      description: 'Can view assigned shipments and update status',
    },
    CUSTOMER: {
      description: 'Can create shipments and view own shipments',
    },
  },
});

@ObjectType('User')
export class UserEntity {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  // Password field is hidden from GraphQL responses
  @HideField()
  password: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Computed field (resolved in resolver)
  @Field()
  fullName?: string;
}
