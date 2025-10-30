import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  action!: string;

  @IsOptional()
  @IsObject()
  actor?: {
    id?: string;
    type?: string;
  };

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  oldValue?: any;

  @IsOptional()
  newValue?: any;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
