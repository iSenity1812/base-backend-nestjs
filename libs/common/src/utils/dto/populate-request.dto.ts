import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PopulateRequestDto {
  @ApiProperty({
    description: 'Type of resource to populate',
    example: 'author',
  })
  @IsString()
  resourceType!: string;

  @ApiProperty({
    description: 'Array of resource IDs to populate',
    example: ['authorId1', 'authorId2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  resourceIds!: string[];
}
