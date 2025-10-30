import { SetMetadata } from '@nestjs/common';

export const IS_VISITOR_ID_EXEMPT_KEY = 'isVisitorIdExempt';
export const VisitorIdExempt = () =>
  SetMetadata(IS_VISITOR_ID_EXEMPT_KEY, true);
