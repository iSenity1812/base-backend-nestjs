import { plainToInstance } from 'class-transformer';

import {
  Body,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Type,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

import { AbstractValidationPipe, validationOptions } from '../pipes';
import {
  ApiResponseDto,
  type FindByIdQueryDto,
  PaginatedApiResponseDto,
  ResponseBuilder,
} from '../utils/dto';
import { PaginationQueryDto } from '../utils/dto/pagination-query.dto';
import type { BaseCRUDService } from './base-crud-service';
import type { BaseEntity } from './base-entity';
import { BaseEntityDto } from './base-entity-dto';

type BaseCRUDControllerParams<Entity, EntityDto, CreateDto, UpdateDto> = {
  entity: Type<Entity>;
  entityDto: Type<EntityDto>;
  createDto?: Type<CreateDto>;
  updateDto?: Type<UpdateDto>;
  allowDelete?: boolean;
  allowFindAll?: boolean;
};

const getEntityName = (entity: Type<BaseEntity>) =>
  entity.name.replace('Entity', '');

export function BaseCRUDController<
  Entity extends BaseEntity,
  EntityDto extends BaseEntityDto,
  CreateDto,
  UpdateDto,
>({
  entity,
  entityDto,
  createDto,
  updateDto,
  allowDelete = false,
  allowFindAll = true,
}: BaseCRUDControllerParams<Entity, EntityDto, CreateDto, UpdateDto>) {
  abstract class BaseHost {
    constructor(readonly crudService: BaseCRUDService<Entity>) {}

    @Get(':id')
    @ApiOperation({ summary: `Get ${getEntityName(entity)} by id` })
    @ApiQuery({
      name: 'populate',
      type: PaginationQueryDto['populate'],
      required: false,
      description: 'Populate field',
      example: 'actor',
    })
    @ApiOkResponse({
      type: ApiResponseDto(entityDto),
      description: `Return ${getEntityName(entity)} by id.`,
    })
    @ApiBearerAuth()
    async findById(
      @Param('id', new ParseUUIDPipe()) id: string,
      @Query()
      query: FindByIdQueryDto,
    ) {
      const { data, populated } = await this.crudService.findById(id, query);
      return ResponseBuilder.createResponse({
        data: plainToInstance(entityDto, data, {
          excludeExtraneousValues: true,
        }),
        populated,
      });
    }

    findAll(_query: any) {}
    create(_body: CreateDto) {}
    update(_id: string, _body: UpdateDto) {}
    delete(_id: string) {}
  }

  let CRUDController = BaseHost;

  if (allowFindAll) {
    class WithFindAllController extends CRUDController {
      @Get()
      @ApiOperation({ summary: `Get all ${getEntityName(entity)}` })
      @ApiOkResponse({
        type: PaginatedApiResponseDto(entityDto),
        description: `Return all ${getEntityName(entity)}`,
      })
      @ApiQuery({
        name: 'page',
        type: PaginationQueryDto['page'],
        required: false,
        default: 1,
        description: 'Page number',
      })
      @ApiQuery({
        name: 'limit',
        type: PaginationQueryDto['limit'],
        required: false,
        default: 10,
        description: 'Items per page',
      })
      @ApiQuery({
        name: 'sort',
        type: PaginationQueryDto['sort'],
        required: false,
        description: 'Sort json',
        example: '{ "createdAt": "DESC" }',
      })
      @ApiQuery({
        name: 'filter',
        type: PaginationQueryDto['filter'],
        required: false,
        description: 'Filter json',
        example: '{ "username": "john_doe" }',
      })
      @ApiQuery({
        name: 'search',
        type: PaginationQueryDto['search'],
        required: false,
        description: 'Full text search',
        example: 'john_doe',
      })
      @ApiQuery({
        name: 'populate',
        type: PaginationQueryDto['populate'],
        required: false,
        description: 'Populate field',
        example: 'actor',
      })
      @ApiBearerAuth()
      async findAll(
        @Query()
        query: PaginationQueryDto,
      ) {
        const { data, total, populated } =
          await this.crudService.findAll(query);
        return ResponseBuilder.createPaginatedResponse({
          data: plainToInstance(entityDto, data, {
            excludeExtraneousValues: true,
          }),
          currentPage: query.page,
          itemsPerPage: query.limit,
          totalItems: total,
          populated: populated,
        });
      }
    }

    CRUDController = WithFindAllController;
  }

  if (createDto) {
    class WithCreateController extends CRUDController {
      @Post()
      @ApiOperation({ summary: `Create a new ${getEntityName(entity)}` })
      @ApiOkResponse({
        type: ApiResponseDto(entityDto),
        description: `The ${getEntityName(entity)} has been successfully created.`,
      })
      @ApiBody({ type: createDto })
      @ApiBearerAuth()
      @UsePipes(
        new AbstractValidationPipe(validationOptions, { body: createDto }),
      )
      async create(@Body() body: CreateDto) {
        const data = await this.crudService.create(
          plainToInstance(entity, body),
        );
        return ResponseBuilder.createResponse({
          data: plainToInstance(entityDto, data, {
            excludeExtraneousValues: true,
          }),
        });
      }
    }

    CRUDController = WithCreateController;
  }

  if (updateDto) {
    class WithUpdateController extends CRUDController {
      @Put(':id')
      @ApiOperation({ summary: `Update ${getEntityName(entity)} by id` })
      @ApiOkResponse({
        type: entityDto,
        description: `The ${getEntityName(entity)} has been successfully updated.`,
      })
      @ApiBody({ type: updateDto })
      @ApiBearerAuth()
      @UsePipes(
        new AbstractValidationPipe(validationOptions, { body: updateDto }),
      )
      async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() body: UpdateDto,
      ) {
        // Save updated entity
        const result = await this.crudService.update(
          id,
          plainToInstance(entity, body),
        );

        return ResponseBuilder.createResponse({
          data: plainToInstance(entityDto, result, {
            excludeExtraneousValues: true,
          }),
        });
      }
    }

    CRUDController = WithUpdateController;
  }

  if (allowDelete) {
    class WithDeleteController extends CRUDController {
      @Delete(':id')
      @ApiOperation({ summary: `Delete ${getEntityName(entity)} by id` })
      @ApiResponse({
        status: 200,
        description: `The ${getEntityName(entity)} has been successfully deleted.`,
      })
      @ApiBearerAuth()
      async delete(@Param('id', new ParseUUIDPipe()) id: string) {
        const data = await this.crudService.delete(id);
        return ResponseBuilder.createResponse({ data });
      }
    }

    CRUDController = WithDeleteController;
  }

  return CRUDController;
}
