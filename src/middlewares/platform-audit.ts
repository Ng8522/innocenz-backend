import { Request, Response, NextFunction } from 'express';
import { logger } from '@/util/logger';
import { logRestMutation, redactSensitive } from '@/features/audit-log/audit.util';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function platformAuditMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!MUTATING_METHODS.has(req.method)) {
    next();
    return;
  }

  if (req.originalUrl.split('?')[0].endsWith('/health')) {
    next();
    return;
  }

  let responseBody: unknown = null;
  const originalJson = res.json.bind(res);
  res.json = function patchedJson(body: unknown) {
    responseBody = body;
    return originalJson(body);
  };

  const requestBody = redactSensitive(req.body);

  res.on('finish', () => {
    if (req.auditLogged) {
      return;
    }

    void logRestMutation(req, res.statusCode, requestBody, responseBody).catch((error) => {
      logger.error('[platformAuditMiddleware] Failed to write audit log', error);
    });
  });

  next();
}
