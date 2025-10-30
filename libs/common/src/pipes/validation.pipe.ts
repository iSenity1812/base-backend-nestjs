import {
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
  Injectable,
  Type,
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

export const validationOptions: ValidationPipeOptions = {
  transform: true, // Tự động chuyển đổi các kiểu dữ liệu
  whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
  forbidNonWhitelisted: true, // Ném lỗi nếu có thuộc tính không được định nghĩa trong DTO
  forbidUnknownValues: true, // Ném lỗi nếu giá trị không xác định được truyền vào
  transformOptions: {
    excludeExtraneousValues: true, // Loại bỏ các thuộc tính không được đánh dấu bằng @Expose()
  },
  errorHttpStatusCode: HttpStatus.BAD_REQUEST,
  exceptionFactory: (errors: ValidationError[]) => {
    const errorFields = generateErrors(errors);
    const message = Object.values(errorFields).join(', ');
    return new BadRequestException(message);
  },
};

export const validationPipe = new ValidationPipe(validationOptions);

@Injectable()
export class AbstractValidationPipe extends ValidationPipe {
  constructor(
    options: ValidationPipeOptions,
    private readonly targetTypes: {
      body?: Type<any>;
      query?: Type<any>;
      param?: Type<any>;
      custom?: Type<any>;
    },
  ) {
    super(options);
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    const targetType = this.targetTypes[metadata.type];
    if (!targetType) {
      return super.transform(value, metadata);
    }
    return super.transform(value, { ...metadata, metatype: targetType });
  }
}

function generateErrors(errors: ValidationError[]) {
  return errors.reduce(
    (accumulator, currentValue) => ({
      ...accumulator,
      [currentValue.property]:
        (currentValue.children?.length ?? 0) > 0
          ? generateErrors(currentValue.children ?? [])
          : Object.values(currentValue.constraints ?? {}).join(', '),
    }),
    {},
  );
}
