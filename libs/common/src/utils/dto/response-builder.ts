import { ApiResponse } from './api-response.dto';
import { PaginatedApiResponse } from './paginated-api-response.dto';
import type { PopulateResultDto } from './populate-result.dto';

type ResponseParams<T> = {
  data: T;
  message?: string;
  statusCode?: number;
  populated?: PopulateResultDto;
};

type PaginatedResponseParams<T> = {
  data: T[];
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  message?: string;
  statusCode?: number;
  populated?: PopulateResultDto;
};

export class ResponseBuilder {
  static createResponse<T>({
    data,
    message = 'Request successful',
    statusCode = 200,
    populated,
  }: ResponseParams<T>): ApiResponse<T> {
    return {
      data,
      message,
      statusCode,
      populated,
    };
  }

  static createPaginatedResponse<T>({
    data,
    totalItems,
    currentPage,
    itemsPerPage,
    message = 'Request successful',
    statusCode = 200,
    populated,
  }: PaginatedResponseParams<T>): PaginatedApiResponse<T> {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return {
      statusCode,
      message,
      data,
      populated,
      meta: {
        totalItems: totalItems || 0,
        itemCount: data.length,
        itemsPerPage: itemsPerPage || data.length,
        totalPages: totalPages || 1,
        currentPage: currentPage || 1,
      },
    };
  }
}
