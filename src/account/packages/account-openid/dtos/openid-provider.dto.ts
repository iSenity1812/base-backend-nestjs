import { BaseEntityDto } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';

export class OpenIdProviderDto extends BaseEntityDto {
  @ApiProperty({
    description: 'Provider internal name (identify)',
    example: 'google',
  })
  name: string;

  @ApiProperty({
    description: 'Provider issuer URL',
    example: 'https://accounts.google.com',
  })
  issuer_url: string;

  @ApiProperty({ description: 'Provider client ID', example: 'your-client-id' })
  client_id: string;

  @ApiProperty({
    description: 'Provider client secret',
    example: 'your-client-secret',
  })
  client_secret: string;

  @ApiProperty({
    description: 'Provider redirect URI',
    example: 'https://your-app.com/auth/callback',
  })
  redirect_uri: string;

  @ApiProperty({ description: 'Is provider enabled? ', example: true })
  enabled: boolean;

  @ApiProperty({ description: 'Provider display name', example: 'Google' })
  display_name: string;

  @ApiProperty({
    description: 'Provider icon URL',
    example: 'https://your-app.com/icons/google.png',
  })
  icon_url: string;
}
