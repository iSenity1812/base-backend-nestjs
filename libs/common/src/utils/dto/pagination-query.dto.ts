import { Expose, Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

import { ParseJson } from '@app/common/decorators';

export class PaginationQueryDto {
  @Expose()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @Expose()
  @IsOptional()
  @ParseJson()
  sort?: any;

  @Expose()
  @IsOptional()
  @ParseJson()
  filter?: any;

  @Expose()
  @IsOptional()
  search?: string;

  @Expose()
  @IsOptional()
  populate?: string;
}
