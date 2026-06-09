import { Request } from 'express';
import { auditLogRepository } from '@/composition-root';
import type { AuditActionType } from '@/features/audit-log/audit.wrapper';
import { paramId } from '@/util/params';

export function getIpAddress(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return forwardedStr.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  return ip === '::1' ? '127.0.0.1' : ip;
}

export function getUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}

export function redactSensitive(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (typeof value !== 'object') return value;

  const redacted: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (/password/i.test(key)) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = redactSensitive(val);
    }
  }
  return redacted;
}

export function entityIdFromResponse(_req: Request, body: unknown): string | null {
  const data = (body as {
    data?: { id?: string; auditLogId?: number; user?: { id?: string } };
  })?.data;
  return data?.id ?? data?.user?.id ?? (data?.auditLogId != null ? String(data.auditLogId) : null);
}

export function entityIdFromParams(req: Request): string | null {
  const id = req.params.id ?? req.params.roleId;
  if (!id) return null;
  return paramId(id);
}

const RESOURCE_ENTITY: Record<string, string> = {
  admin: 'Admin',
  auth: 'Auth',
  roles: 'Role',
  modules: 'Module',
  permissions: 'Permission',
  'role-permissions': 'RolePermission',
  rbac: 'RBAC',
};

export function resolveEntityFromPath(path: string): string {
  const normalizedPath = path.toLowerCase();
  if (normalizedPath.includes('/auth/register')) return 'Admin';
  if (normalizedPath.includes('/auth/login')) return 'Auth';

  const segments = path.split('/').filter(Boolean);
  const apiIndex = segments.indexOf('v1');
  const resource = apiIndex >= 0 ? segments[apiIndex + 1] : segments[0];
  const subResource = apiIndex >= 0 ? segments[apiIndex + 2] : segments[1];

  if (resource === 'rbac' && subResource) {
    return RESOURCE_ENTITY[subResource] ?? subResource;
  }

  return RESOURCE_ENTITY[resource ?? ''] ?? resource ?? 'Unknown';
}

export function resolveRestAction(method: string, path: string): string {
  const normalizedPath = path.toLowerCase();

  if (method === 'POST' && normalizedPath.includes('/auth/login')) return 'LOGIN';
  if (method === 'POST' && normalizedPath.includes('/auth/register')) return 'CREATE';

  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return normalizedPath.includes('/sync') ? 'BULK_UPDATE' : 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return method;
  }
}

type WriteAuditInput = {
  req: Request;
  action: string;
  entity: string;
  entityId?: string | null;
  oldData?: unknown;
  newData?: unknown;
};

export async function writePlatformAuditLog(input: WriteAuditInput): Promise<void> {
  const { req, action, entity, entityId, oldData, newData } = input;

  await auditLogRepository.createAuditLog({
    userId: req.admin?.id ?? null,
    role: req.admin ? 'admin' : null,
    action,
    entity,
    entityId: entityId ?? null,
    oldData,
    newData,
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req),
  });
}

export async function logRestMutation(
  req: Request,
  statusCode: number,
  requestBody: unknown,
  responseBody: unknown,
): Promise<void> {
  const path = req.originalUrl.split('?')[0];
  const entity = resolveEntityFromPath(path);
  const baseAction = resolveRestAction(req.method, path);
  const success = statusCode >= 200 && statusCode < 300;
  const action = success ? baseAction : `${baseAction}_FAILED`;

  const isCreate = baseAction === 'CREATE' || baseAction === 'LOGIN';
  const isDelete = baseAction === 'DELETE';

  const entityId =
    entityIdFromParams(req) ??
    entityIdFromResponse(req, responseBody) ??
    ((responseBody as { data?: { id?: string } })?.data?.id ?? null);

  const responseData = (responseBody as { data?: unknown })?.data ?? responseBody;

  await writePlatformAuditLog({
    req,
    action,
    entity,
    entityId,
    oldData: !isCreate && success ? redactSensitive(requestBody) : undefined,
    newData: !isDelete
      ? redactSensitive(success ? (responseData ?? requestBody) : { requestBody, responseBody })
      : undefined,
  });
}

export async function logGraphQLMutation(
  req: Request,
  fieldName: string,
  variables: Record<string, unknown> | undefined,
  result: unknown,
  errorMessage?: string,
): Promise<void> {
  const entity = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  let action: AuditActionType | string;

  if (fieldName === 'login') {
    action = errorMessage ? 'LOGIN_FAILED' : 'LOGIN';
  } else if (fieldName.startsWith('create')) {
    action = errorMessage ? 'CREATE_FAILED' : 'CREATE';
  } else if (fieldName.startsWith('update')) {
    action = errorMessage ? 'UPDATE_FAILED' : 'UPDATE';
  } else if (fieldName.startsWith('delete')) {
    action = errorMessage ? 'DELETE_FAILED' : 'DELETE';
  } else {
    action = errorMessage ? 'MUTATION_FAILED' : 'MUTATION';
  }

  const resultObj = result as { id?: string; user?: { id?: string } } | null;
  const entityId = resultObj?.id ?? resultObj?.user?.id ?? null;

  await writePlatformAuditLog({
    req,
    action,
    entity,
    entityId,
    oldData:
      action.includes('UPDATE') || action.includes('DELETE') ? redactSensitive(variables) : undefined,
    newData: errorMessage
      ? { variables: redactSensitive(variables), error: errorMessage }
      : redactSensitive(result),
  });
}
