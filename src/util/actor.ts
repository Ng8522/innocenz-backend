import { Request } from 'express';

export function getActor(req: Request): string {
  return req.admin?.email ?? 'system';
}
