import {
  Any,
  ArrayContainedBy,
  ArrayContains,
  ArrayOverlap,
  Between,
  Equal,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

export const FILTER_OPERATIONS = {
  $not: { operation: Not },
  $lt: { operation: LessThan },
  $lte: { operation: LessThanOrEqual },
  $gt: { operation: MoreThan },
  $gte: { operation: MoreThanOrEqual },
  $eq: { operation: Equal },
  $like: { operation: Like },
  $ilike: { operation: ILike },
  $between: { operation: Between },
  $in: { operation: In },
  $any: { operation: Any },
  $isNull: { operation: IsNull },
  $arrayContains: { operation: ArrayContains },
  $arrayContainedBy: { operation: ArrayContainedBy },
  $arrayOverlap: { operation: ArrayOverlap },
};

export function processValue(value: any): any {
  // Handle $toDate operator
  if (typeof value === 'object' && value !== null && '$toDate' in value) {
    const dateValue = value.$toDate;
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      return new Date(dateValue);
    }
    throw new Error(`Invalid $toDate value: ${dateValue}`);
  }

  // Handle arrays (for $between, $in, etc.)
  if (Array.isArray(value)) {
    return value.map((item) => processValue(item));
  }

  // Return value as-is for non-date values
  return value;
}

export function parseMongoStyleFilter(filter: any): any {
  const whereConditions: any = {};

  Object.entries(filter).forEach(([key, value]) => {
    if (key.startsWith('$')) {
      // Handle logical operators like $and, $or, etc.
      if (key === '$and' && Array.isArray(value)) {
        const andConditions = value.map((condition) =>
          parseMongoStyleFilter(condition),
        );
        Object.assign(whereConditions, ...andConditions);
      } else if (key === '$or' && Array.isArray(value)) {
        // For $or, we need to return an array of conditions for TypeORM
        whereConditions.$or = value.map((condition) =>
          parseMongoStyleFilter(condition),
        );
      } else {
        throw new Error(`Logical operator ${key} is not yet supported`);
      }
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      // Handle field-level operators like { "createdAt": { "$gt": "2025-09-11", "$lt": "2025-09-12" } }
      Object.entries(value).forEach(([operator, operatorValue]) => {
        const op = FILTER_OPERATIONS[operator];
        if (!op) {
          throw new Error(`Invalid filter operation: ${operator}`);
        }

        // Process value to handle $toDate and other operators
        const processedValue = processValue(operatorValue);

        // For multiple operators on same field, we'll store them as separate conditions
        // The key will include the operator to make it unique
        const conditionKey = `${key}_${operator}`;

        // Apply the operation to the field
        if (operator === '$isNull') {
          whereConditions[conditionKey] = { [key]: op.operation() };
        } else if (
          operator === '$between' &&
          Array.isArray(processedValue) &&
          processedValue.length === 2
        ) {
          whereConditions[conditionKey] = {
            [key]: op.operation(processedValue[0], processedValue[1]),
          };
        } else if (operator === '$in' && Array.isArray(processedValue)) {
          whereConditions[conditionKey] = {
            [key]: op.operation(processedValue),
          };
        } else {
          whereConditions[conditionKey] = {
            [key]: op.operation(processedValue),
          };
        }
      });
    } else {
      // Simple equality check
      whereConditions[key] = value;
    }
  });

  return whereConditions;
}

// Legacy function for backward compatibility with array format
export function parseWhere(operation: string, value: any) {
  const op = FILTER_OPERATIONS[operation];
  if (!op) {
    throw new Error(`Invalid filter operation: ${operation}`);
  }
  if (
    Array.isArray(value) &&
    typeof value[0] === 'string' &&
    value[0].startsWith('$')
  ) {
    const subWhere = parseWhere(value[0], value[1]);
    return op.operation(subWhere);
  } else {
    // Process value to handle $toDate and other operators in legacy format too
    const processedValue = processValue(value[1]);
    return { [value[0]]: op.operation(processedValue) };
  }
}
