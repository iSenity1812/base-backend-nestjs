import { ApiProperty } from '@nestjs/swagger';

export class FiltersDto {
  @ApiProperty({ type: [String], description: 'distinct actions available' })
  actions!: string[];

  @ApiProperty({
    type: [String],
    description: 'distinct resource types available',
  })
  resources!: string[];
}
