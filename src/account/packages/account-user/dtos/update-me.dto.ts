import { PartialType, PickType } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class UpdateMeDto extends PartialType(
  PickType(UserDto, ['fullName', 'email'] as const),
) {}
