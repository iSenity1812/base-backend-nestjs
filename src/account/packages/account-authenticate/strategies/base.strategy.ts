import { UserEntity } from '../../account-user/entities/user.entity';
import type { IAuthStrategy } from '../interfaces/auth-strategy.interface';

export abstract class BaseStrategy implements IAuthStrategy {
  abstract method: string;
  abstract validate(data: any): Promise<UserEntity>;
}
