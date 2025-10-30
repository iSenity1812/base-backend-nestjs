import { BaseCommand } from '@app/common';
import type { UserRole } from '@app/common/enums';

export class CreateUserCommand extends BaseCommand {
  username: string;
  email: string;
  fullName: string;
  role?: UserRole;
  password?: string;
}
