import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer/types';
import { IsOptional, IsString } from 'class-validator/types';

export class OpenIdCallbackDto {
  @ApiProperty({
    description: 'Authorization code returned by the identity provider',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  code?: string;

  @ApiProperty({
    description: 'State value returned by the identity provider',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  state?: string;

  @ApiProperty({
    description: 'Error returned by provider (if any) ',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  error?: string;
}
