import { SelectQueryBuilder } from 'typeorm';

import { parseMongoStyleFilter, parseWhere } from './mongo-style-filter';

export interface FilterOptions {
  filter?: any;
  entityAlias?: string;
}

/**
 * Applies filters to a TypeORM query builder
 * @param queryBuilder - The TypeORM query builder instance
 * @param options - Filter options containing the filter object and entity alias
 */
export function applyFiltersToQueryBuilder<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: FilterOptions,
): void {
  const { filter, entityAlias = 'e' } = options;

  if (!filter) {
    return;
  }

  try {
    // Try to parse as MongoDB-style filter first
    const whereConditions = parseMongoStyleFilter(filter);

    // Handle $or conditions separately as TypeORM needs them in a specific format
    if (whereConditions.$or) {
      queryBuilder.andWhere(whereConditions.$or);
      delete whereConditions.$or;
    }

    // Apply each condition separately to handle multiple operators on same field
    Object.entries(whereConditions).forEach(([conditionKey, condition]) => {
      if (typeof condition === 'object' && condition !== null) {
        // This is a condition object like { fieldName: TypeORMOperation }
        queryBuilder.andWhere(condition);
      } else {
        // This is a simple field = value condition
        const fieldName = conditionKey.replace(/_\$\w+$/, ''); // Remove operator suffix if present
        queryBuilder.andWhere(
          `${entityAlias}.${fieldName} = :${conditionKey}`,
          {
            [conditionKey]: condition,
          },
        );
      }
    });
  } catch (_mongoError) {
    // Fallback to legacy array-based format for backward compatibility
    Object.entries(filter).forEach(([key, value]) => {
      if (key.startsWith('$')) {
        // make sure value is an array
        if (!Array.isArray(value)) {
          throw new Error(`Value for filter ${key} should be an array`);
        }
        queryBuilder.andWhere(parseWhere(key, value));
      } else {
        queryBuilder.andWhere(`${entityAlias}.${key} = :${key}`, {
          [key]: value,
        });
      }
    });
  }
}
