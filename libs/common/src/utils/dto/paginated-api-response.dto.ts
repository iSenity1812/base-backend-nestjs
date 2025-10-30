import { ApiProperty } from '@nestjs/swagger';
import { ApiResponse } from './api-response.dto';
import type { Type } from '@nestjs/common';

export class PaginationMeta {
  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  itemsPerPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;
}

export abstract class PaginatedApiResponse<T> extends ApiResponse<T[]> {
  @ApiProperty()
  meta: PaginationMeta;

  @ApiProperty({ type: [Object] })
  declare data: T[];
}

export function PaginatedApiResponseDto<T>(dto: Type<T>) {
  abstract class Host extends PaginatedApiResponse<T> {
    @ApiProperty({ type: [dto] })
    declare data: T[];
  }

  Object.defineProperty(Host, 'name', {
    writable: false,
    value: `${dto.name}PaginatedResponseDto`, // Customize the name
  });

  return Host;
}
