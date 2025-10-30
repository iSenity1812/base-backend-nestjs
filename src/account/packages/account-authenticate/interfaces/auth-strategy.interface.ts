import { UserEntity } from '../../account-user/entities/user.entity';

export interface IAuthStrategy {
  method: string;
  validate(data: any): Promise<UserEntity>;
}
