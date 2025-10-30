import { ACCOUNT_OPERATION } from '@app/common/constants';
import { VerifyAccessTokenCommand } from './verify-access-token.command';

export const OperationsMap = {
  [ACCOUNT_OPERATION.VERIFY_ACCESS_TOKEN]: VerifyAccessTokenCommand,
};

export { VerifyAccessTokenCommand };
