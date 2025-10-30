import { BaseEntityDto } from '@app/common';
import { UserRole, UserStatus } from '@app/common/enums';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer/types';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
} from 'class-validator/types';

export class UserDto extends BaseEntityDto {
  @ApiProperty({ example: 'uuid-value', description: 'Unique user identifier' })
  @IsUUID()
  @Expose()
  declare id: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  @Expose()
  username: string;

  // email
  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  @Expose()
  email: string;

  // password (optional)
  @ApiProperty({ example: 'password', description: 'User password' })
  @IsString()
  @Expose()
  password?: string;

  // fullName
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  @Expose()
  fullName: string;

  // role : UserRole
  @ApiProperty({
    example: 'user',
    description: 'User role',
    default: UserRole.BASIC,
  })
  @IsEnum(UserRole)
  @Expose()
  role: UserRole;

  // status: UserStatus
  @ApiProperty({
    example: 'active',
    description: 'User status',
    default: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  @Expose()
  status: UserStatus;
}

export class PublicUserDto extends PickType(UserDto, [
  'id',
  'username',
  'email',
  'fullName',
  'role',
  'status',
] as const) {}
