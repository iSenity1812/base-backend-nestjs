import { ApiProperty } from '@nestjs/swagger';

export class UserMetricsDto {
  @ApiProperty({ description: 'Total number of users', example: 1500 })
  total: number;

  @ApiProperty({ description: 'Count of users grouped by status' })
  byStatus: Record<string, number>;
}
