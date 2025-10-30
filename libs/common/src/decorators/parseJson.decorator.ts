import { Transform } from 'class-transformer';

import { ForbiddenException } from '@nestjs/common';

function parseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('JSON parse error:', error);
    throw new ForbiddenException('Invalid JSON format');
  }
}

export const ParseJson = () =>
  Transform(({ value }) => (value ? parseJson(value) : null));
