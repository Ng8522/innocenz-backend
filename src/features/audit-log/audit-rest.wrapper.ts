import { Request, Response, NextFunction, RequestHandler } from 'express';
import type { AuditActionType } from './audit.wrapper';
import { logger } from '@/util/logger';
import {
  entityIdFromParams,
  entityIdFromResponse,
  redactSensitive,
  serializeForAudit,
  writePlatformAuditLog,
} from './audit.util';

export { entityIdFromParams, entityIdFromResponse } from './audit.util';

export interface RestAuditOptions {
  entity: string;
  action: AuditActionType;
  getEntityId?: (req: Request, responseBody: unknown) => string | string[] | null;
  getOldData?: (req: Request) => Promise<unknown>;
  getNewData?: (req: Request, responseBody: unknown) => unknown;
}

async function writeRestAuditLog(
  req: Request,
  options: RestAuditOptions,
  responseBody: unknown,
  oldData: unknown,
): Promise<void> {
  const isCreateAction = options.action === 'CREATE' || options.action === 'BULK_CREATE';
  const isDeleteAction = options.action === 'DELETE' || options.action === 'BULK_DELETE';

  const entityIdValue = options.getEntityId
    ? options.getEntityId(req, responseBody)
    : entityIdFromParams(req);
  const newDataValue = options.getNewData
    ? options.getNewData(req, responseBody)
    : ((responseBody as { data?: unknown })?.data ?? responseBody);

  if (Array.isArray(entityIdValue)) {
    const oldArray = Array.isArray(oldData) ? oldData : entityIdValue.map(() => oldData);
    const newArray = Array.isArray(newDataValue) ? newDataValue : entityIdValue.map(() => newDataValue);

    await Promise.all(
      entityIdValue.map((id, index) =>
        writePlatformAuditLog({
          req,
          action: options.action,
          entity: options.entity,
          entityId: id,
          oldData: !isCreateAction ? redactSensitive(serializeForAudit(oldArray[index])) : undefined,
          newData: !isDeleteAction ? redactSensitive(serializeForAudit(newArray[index])) : undefined,
        }),
      ),
    );
    return;
  }

  await writePlatformAuditLog({
    req,
    action: options.action,
    entity: options.entity,
    entityId: entityIdValue,
    oldData: !isCreateAction ? redactSensitive(serializeForAudit(oldData)) : undefined,
    newData: !isDeleteAction ? redactSensitive(serializeForAudit(newDataValue)) : undefined,
  });
}

/** Opt-in wrapper for routes that need oldData capture. Global middleware covers everything else. */
export function withRestAudit(options: RestAuditOptions, handler: RequestHandler): RequestHandler {
  const isCreateAction = options.action === 'CREATE' || options.action === 'BULK_CREATE';

  return async (req: Request, res: Response, next: NextFunction) => {
    req.auditLogged = true;
    let oldData: unknown = null;
    let capturedBody: unknown = null;

    const originalJson = res.json.bind(res);
    res.json = function patchedJson(body: unknown) {
      capturedBody = body;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        void writeRestAuditLog(req, options, capturedBody, oldData).catch((error) => {
          logger.error('[withRestAudit] Failed to write audit log', error);
        });
      }

      return originalJson(body);
    };

    try {
      if (options.getOldData && !isCreateAction) {
        try {
          oldData = await options.getOldData(req);
        } catch (error) {
          logger.warn('[withRestAudit] Failed to fetch old data:', error);
        }
      }

      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
