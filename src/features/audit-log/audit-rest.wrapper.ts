import { Request, Response, NextFunction, RequestHandler } from 'express';
import { auditLogRepository } from '@/composition-root';
import type { AuditActionType } from './audit.wrapper';
import { logger } from '@/util/logger';
import { paramId } from '@/util/params';

export interface RestAuditOptions {
  entity: string;
  action: AuditActionType;
  getEntityId?: (req: Request, responseBody: unknown) => string | string[] | null;
  getOldData?: (req: Request) => Promise<unknown>;
  getNewData?: (req: Request, responseBody: unknown) => unknown;
}

export function entityIdFromResponse(_req: Request, body: unknown): string | null {
  const data = (body as { data?: { id?: string } })?.data;
  return data?.id ?? null;
}

export function entityIdFromParams(req: Request): string | null {
  const id = req.params.id ?? req.params.roleId;
  if (!id) return null;
  return paramId(id);
}

function getIpAddress(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return forwardedStr.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function getUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}

async function writeAuditLog(
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
        auditLogRepository.createAuditLog({
          userId: req.admin?.id ?? null,
          role: req.admin ? 'admin' : null,
          action: options.action,
          entity: options.entity,
          entityId: id,
          oldData: !isCreateAction ? oldArray[index] : undefined,
          newData: !isDeleteAction ? newArray[index] : undefined,
          ipAddress: getIpAddress(req),
          userAgent: getUserAgent(req),
        }),
      ),
    );
    return;
  }

  await auditLogRepository.createAuditLog({
    userId: req.admin?.id ?? null,
    role: req.admin ? 'admin' : null,
    action: options.action,
    entity: options.entity,
    entityId: entityIdValue,
    oldData: !isCreateAction ? oldData : undefined,
    newData: !isDeleteAction ? newDataValue : undefined,
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req),
  });
}

export function withRestAudit(options: RestAuditOptions, handler: RequestHandler): RequestHandler {
  const isCreateAction = options.action === 'CREATE' || options.action === 'BULK_CREATE';

  return async (req: Request, res: Response, next: NextFunction) => {
    let oldData: unknown = null;
    let capturedBody: unknown = null;

    const originalJson = res.json.bind(res);
    res.json = function patchedJson(body: unknown) {
      capturedBody = body;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        void writeAuditLog(req, options, capturedBody, oldData).catch((error) => {
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
