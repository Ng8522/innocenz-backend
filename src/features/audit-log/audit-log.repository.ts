import { eq, and, desc, SQL } from 'drizzle-orm';
import { db } from '@/db/index';
import { AuditLogTable } from '@/features/audit-log/audit-log.model';

export class AuditLogRepositoryClass {
  async list(filter: { userId?: string; entity?: string; action?: string } = {}, limit = 50) {
    const conditions: SQL[] = [];
    if (filter.userId) conditions.push(eq(AuditLogTable.userId, filter.userId));
    if (filter.entity) conditions.push(eq(AuditLogTable.entity, filter.entity));
    if (filter.action) conditions.push(eq(AuditLogTable.action, filter.action));

    return db
      .select()
      .from(AuditLogTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(AuditLogTable.createdAt))
      .limit(limit);
  }

  async getById(id: number) {
    const rows = await db
      .select()
      .from(AuditLogTable)
      .where(eq(AuditLogTable.auditLogId, id))
      .limit(1);
    return rows[0] ?? null;
  }
}
