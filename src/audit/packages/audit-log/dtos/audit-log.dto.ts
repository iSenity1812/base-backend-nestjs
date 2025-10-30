import { Expose } from 'class-transformer';
import { IsObject, IsOptional, IsString, Length } from 'class-validator';

import { BaseEntityDto } from '@app/common/base';
import { ApiProperty } from '@nestjs/swagger';

export class AuditLogDto extends BaseEntityDto {
  @ApiProperty({ example: 'USER_UPDATED', description: 'The action performed' })
  @IsString()
  @Length(1, 50)
  @Expose()
  action!: string;

  @ApiProperty({
    example: 'actor-uuid',
    description: 'The id of the actor',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  actorId?: string;

  @ApiProperty({
    example: 'SYSTEM',
    description: 'The type of the actor',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  actorType?: string;

  @ApiProperty({
    example: 'User',
    description: 'The resource type affected',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  resourceType?: string;

  @ApiProperty({
    example: 'resource-uuid',
    description: 'The id of the resource',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  resourceId?: string;

  @ApiProperty({
    example: {},
    description: 'Previous value of the resource',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @Expose()
  oldValue?: any;

  @ApiProperty({
    example: {},
    description: 'New value of the resource',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @Expose()
  newValue?: any;

  @ApiProperty({
    example: {},
    description: 'Computed diff of changes',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @Expose()
  diff?: any;

  @ApiProperty({
    example: {},
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @Expose()
  metadata?: Record<string, any>;
}
