import { Repository } from 'typeorm';

import { NotFoundException } from '@nestjs/common';

import { FindByIdQueryDto, PopulateResultDto } from '../utils/dto';
import { PaginationQueryDto } from '../utils/dto/pagination-query.dto';
import { applyFiltersToQueryBuilder } from '../utils/filter';
import { BaseEntity } from './base-entity';

export abstract class BaseCRUDService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async getSearchableColumns(): Promise<string[]> {
    return [];
  }

  /**
   * Override this method in child services to populate related resources
   * @param populateFields - List of fields to populate (e.g., ['actor', 'resource'])
   * @param entities - Entities to populate for
   * @returns PopulateResultDto containing populated data
   */
  async populate(
    _populateFields: string[],
    _entities: T | T[],
  ): Promise<PopulateResultDto> {
    // Default implementation returns empty result
    // Child services should override this method to implement specific populate logic
    return {};
  }

  async create(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async findAll(
    query: Partial<PaginationQueryDto> = {},
  ): Promise<{ data: T[]; total: number; populated?: PopulateResultDto }> {
    const { page = 1, limit = 10, sort, filter, search, populate } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('e');

    if (filter) {
      applyFiltersToQueryBuilder(queryBuilder, { filter });
    }

    if (search) {
      // // check if the entity has the documentWithWeights column
      // const hasDocumentWithWeights = this.repository.metadata.columns.some(
      //   col => col.propertyName === 'documentWithWeights',
      // );
      // if (!hasDocumentWithWeights) {
      //   throw new Error(
      //     `Full-text search is not enabled for this entity. Please ensure the entity has a 'documentWithWeights' column.`,
      //   );
      // }

      // queryBuilder.andWhere(`e.documentWithWeights @@ websearch_to_tsquery(:search)`, {
      //   search: `${search}:*`,
      // });
      // queryBuilder.addOrderBy(
      //   `ts_rank(e.documentWithWeights, websearch_to_tsquery(:search))`,
      //   'DESC',
      // );
      const searchableColumns = await this.getSearchableColumns();
      if (searchableColumns.length > 0) {
        const searchConditions = searchableColumns
          .map((col) => `e.${col} ILIKE :search`)
          .join(' OR ');
        queryBuilder.andWhere(`(${searchConditions})`, {
          search: `%${search}%`,
        });
      }
    }

    if (sort) {
      Object.entries(sort).forEach(([key, value]) => {
        queryBuilder.addOrderBy(`e.${key}`, value as 'ASC' | 'DESC');
      });
    }

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Handle populate if requested
    let populated: PopulateResultDto | undefined;
    if (populate && populate.length > 0 && data.length > 0) {
      populated = await this.populate(populate.split(','), data);
    }

    return { data, total, populated };
  }

  async findById(
    id: string,
    query?: Partial<FindByIdQueryDto>,
  ): Promise<{ data: T; populated?: PopulateResultDto }> {
    const entity = await this.repository.findOne({ where: { id } as any });

    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }

    // Handle populate if requested
    let populated: PopulateResultDto | undefined;
    if (query?.populate && query.populate.length > 0) {
      populated = await this.populate(query.populate.split(','), entity);
    }

    return { data: entity, populated };
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }
    return this.repository.save(Object.assign(entity, data));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
