import { Type } from '@nestjs/common';
import { ICommand } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { SseClientConnection } from '../types';

export const ERROR_CODE = {
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
};

export const operationsMap = new Map<string, Type<ICommand>>();
export const clientsMap = new Map<string, ClientProxy>();

export const sseClients = new Map<string, SseClientConnection[]>();
