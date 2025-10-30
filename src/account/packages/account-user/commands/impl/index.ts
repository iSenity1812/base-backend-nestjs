import { ACCOUNT_OPERATION } from '@app/common/constants';
import { GetUserInfoCommand } from './get-user-info.command';
import { FindUserByIdentifierCommand } from './find-user-by-identifier.command';
import { CreateUserCommand } from './create-user.command';
import { BatchGetUsersCommand } from './batch-get-users.command';

export const OperationsMap = {
  [ACCOUNT_OPERATION.GET_USER_INFO]: GetUserInfoCommand,
  [ACCOUNT_OPERATION.FIND_USER_BY_IDENTIFIER]: FindUserByIdentifierCommand,
  [ACCOUNT_OPERATION.CREATE_USER]: CreateUserCommand,
  [ACCOUNT_OPERATION.BATCH_GET_USERS]: BatchGetUsersCommand,
};

export {
  FindUserByIdentifierCommand,
  GetUserInfoCommand,
  CreateUserCommand,
  BatchGetUsersCommand,
};
