import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { UserRole } from '@prisma/client';

@InputType()
export class UserFilterInput {
  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string; // Search across email, firstName, lastName
}
