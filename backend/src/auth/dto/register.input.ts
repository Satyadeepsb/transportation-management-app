import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @Field()
  @IsString()
  @MinLength(2)
  firstName: string;

  @Field()
  @IsString()
  @MinLength(2)
  lastName: string;

  @Field(() => UserRole, { defaultValue: UserRole.CUSTOMER })
  @IsEnum(UserRole)
  role: UserRole = UserRole.CUSTOMER;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;
}
