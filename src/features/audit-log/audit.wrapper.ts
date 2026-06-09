import { randomUUID } from 'crypto';
import { GraphQLContext } from '@/graphql/context';
import { AuditLogRepositoryClass } from './audit.repository';
import { logger } from '@/util/logger';
import { db } from '@/db/index';

export type AuditActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'BULK_CREATE'
  | 'BULK_UPDATE'
  | 'BULK_DELETE';

export interface WithAuditOptions<TArgs, TResult> {
  entity: string;
  action: AuditActionType;
  getEntityId?: (result: TResult | null, args: TArgs) => string | string[] | null;
  getOldData?: (args: TArgs, context: GraphQLContext) => Promise<unknown> | unknown;
  getNewData?: (result: TResult | null, args: TArgs) => unknown;
}

export type ResolverFn<TParent, TArgs, TResult> = (
  parent: TParent,
  args: TArgs,
  context: GraphQLContext,
  info: unknown,
) => Promise<TResult>;

const auditLogRepository = new AuditLogRepositoryClass();

function getIpAddress(context: GraphQLContext): string {
  const req = context.req;
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

function getUserAgent(context: GraphQLContext): string {
  return context.req.headers['user-agent'] || 'unknown';
}

function getUserRole(context: GraphQLContext): string | null {
  return context.user ? 'admin' : null;
}

export function withAudit<TParent, TArgs, TResult>(
  options: WithAuditOptions<TArgs, TResult>,
  resolver: ResolverFn<TParent, TArgs, TResult>,
): ResolverFn<TParent, TArgs, TResult> {
  const { entity, action, getEntityId, getOldData, getNewData } = options;
  const isBulkAction = action === 'BULK_CREATE' || action === 'BULK_UPDATE' || action === 'BULK_DELETE';
  const isCreateAction = action === 'CREATE' || action === 'BULK_CREATE';
  const isDeleteAction = action === 'DELETE' || action === 'BULK_DELETE';

  return async (parent, args, context, info) => {
    const batchId = isBulkAction ? randomUUID() : null;
    let oldData: unknown = null;
    let result: TResult | null = null;

    return await db.transaction(async (tx) => {
      try {
        const contextWithTx: GraphQLContext = { ...context, tx };

        if (
          getOldData &&
          (action === 'UPDATE' ||
            action === 'DELETE' ||
            action === 'BULK_UPDATE' ||
            action === 'BULK_DELETE')
        ) {
          try {
            oldData = await getOldData(args, contextWithTx);
          } catch (error) {
            logger.warn('[withAudit] Failed to fetch old data:', error);
          }
        }

        result = await resolver(parent, args, contextWithTx, info);

        const entityIdValue = getEntityId ? getEntityId(result, args) : null;
        const newDataValue = getNewData ? getNewData(result, args) : result;

        if (isBulkAction && Array.isArray(entityIdValue)) {
          const oldArray = Array.isArray(oldData) ? oldData : entityIdValue.map(() => oldData);
          const newArray = Array.isArray(newDataValue) ? newDataValue : entityIdValue.map(() => newDataValue);

          await Promise.all(
            entityIdValue.map((id, index) =>
              auditLogRepository.createAuditLog(
                {
                  userId: context.user?.id ?? null,
                  role: getUserRole(context),
                  action,
                  entity,
                  entityId: id,
                  batchId,
                  oldData: !isCreateAction ? oldArray[index] : undefined,
                  newData: !isDeleteAction ? newArray[index] : undefined,
                  ipAddress: getIpAddress(context),
                  userAgent: getUserAgent(context),
                },
                tx,
              ),
            ),
          );
        } else {
          const entityId = Array.isArray(entityIdValue) ? (entityIdValue[0] ?? null) : entityIdValue;
          const newData = Array.isArray(newDataValue) ? newDataValue[0] : newDataValue;

          await auditLogRepository.createAuditLog(
            {
              userId: context.user?.id ?? null,
              role: getUserRole(context),
              action,
              entity,
              entityId,
              batchId,
              oldData: !isCreateAction ? oldData : undefined,
              newData: !isDeleteAction ? newData : undefined,
              ipAddress: getIpAddress(context),
              userAgent: getUserAgent(context),
            },
            tx,
          );
        }

        return result;
      } catch (error) {
        try {
          const entityIdValue = getEntityId ? getEntityId(result, args) : null;
          const entityId = Array.isArray(entityIdValue) ? entityIdValue.join(',') : entityIdValue;

          await auditLogRepository.createAuditLog(
            {
              userId: context.user?.id ?? null,
              role: getUserRole(context),
              action: `${action}_FAILED`,
              entity,
              entityId,
              batchId,
              oldData: action !== 'CREATE' ? oldData : undefined,
              newData: { args, error: error instanceof Error ? error.message : String(error) },
              ipAddress: getIpAddress(context),
              userAgent: getUserAgent(context),
            },
            tx,
          );
        } catch (logError) {
          logger.error('[withAudit] Failed to create audit log for failed mutation:', logError);
        }

        throw error;
      }
    });
  };
}

export function createEntityAudit(entity: string) {
  return function <TParent, TArgs, TResult>(
    options: Omit<WithAuditOptions<TArgs, TResult>, 'entity'>,
    resolver: ResolverFn<TParent, TArgs, TResult>,
  ): ResolverFn<TParent, TArgs, TResult> {
    return withAudit({ ...options, entity }, resolver);
  };
}
