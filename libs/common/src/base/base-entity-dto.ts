import { BaseEntity } from './base-entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

export abstract class BaseEntityDto extends BaseEntity {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier',
  })
  @IsUUID()
  @Expose()
  declare id: string; // Non-null assertion operator, xác nhận giá trị sẽ không phải null

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Creation timestamp',
  })
  @Expose()
  declare readonly createdAt: Date; // Sử dụng declare nếu bạn không khởi tạo giá trị

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Last updated timestamp',
  })
  @Expose()
  declare readonly updatedAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Deletion timestamp',
  })
  @Expose()
  declare deletedAt: Date;
}
