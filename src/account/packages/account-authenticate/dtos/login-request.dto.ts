import { ApiProperty } from '@nestjs/swagger';
import { LoginMethod } from '../interfaces';
import { IsEnum, IsNotEmpty, IsObject } from 'class-validator/types';
import { Expose } from 'class-transformer/types';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Authentication method to use for login',
    enum: LoginMethod,
    example: LoginMethod.PASSWORD,
  })
  @IsEnum(LoginMethod)
  @IsNotEmpty()
  @Expose()
  method: LoginMethod;

  @ApiProperty({
    description: 'Authentication data containing credentials',
    example: { username: 'admin@example.com', password: 'changeme' },
  })
  @IsObject()
  @IsNotEmpty()
  @Expose()
  data: any;
}
