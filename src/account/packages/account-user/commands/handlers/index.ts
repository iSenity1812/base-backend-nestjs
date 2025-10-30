import { BatchGetUserHandler } from './batch-get-users.handler';
import { GetUserInfoHandler } from './get-user-info.handler';
import { FindUserByIdentifierHandler } from './find-user-by-identifier.handler';
import { CreateUserHandler } from './create-user.handler';

export const CommandHandlers = [
  BatchGetUserHandler,
  GetUserInfoHandler,
  FindUserByIdentifierHandler,
  CreateUserHandler,
];
