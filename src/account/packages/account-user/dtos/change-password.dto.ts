import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer/types';
import { IsString, MinLength } from 'class-validator/types';

export class ChangePasswordDto {
  @Expose()
  @IsString()
  @MinLength(1)
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Current user password',
  })
  currentPassword!: string;

  @Expose()
  @IsString()
  @MinLength(8)
  @ApiProperty({
    example: 'newSecurePassword456',
    description: 'New user password',
  })
  newPassword!: string;

  // confirmNewPassword
  @Expose()
  @IsString()
  @MinLength(8)
  @ApiProperty({
    example: 'newSecurePassword456',
    description: 'Confirmation of the new user password',
  })
  confirmNewPassword!: string;
}
