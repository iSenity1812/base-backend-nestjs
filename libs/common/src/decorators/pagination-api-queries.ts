import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { PaginationQueryDto } from '../utils/dto';

export function ApiPaginationQueries() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      type: PaginationQueryDto['page'],
      required: false,
      default: 1,
      description: 'Page number for pagination',
    }),

    ApiQuery({
      name: 'limit',
      type: PaginationQueryDto['limit'],
      required: false,
      default: 10,
      description: 'Number of items per page for pagination',
    }),

    ApiQuery({
      name: 'sort',
      type: PaginationQueryDto['sort'],
      required: false,
      description: 'Sorting criteria in JSON format',
      example: '{"createdAt":"DESC"}',
    }),

    ApiQuery({
      name: 'filter',
      type: PaginationQueryDto['filter'],
      required: false,
      description: 'Filtering criteria in JSON format',
      example: '{"status":"active"}',
    }),

    ApiQuery({
      name: 'search',
      type: PaginationQueryDto['search'],
      required: false,
      description: 'Full-text search query string',
      example: 'search term',
    }),
  );
}
