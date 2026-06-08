import 'dotenv/config';
import { fileURLToPath } from 'node:url';

import { eq, and } from 'drizzle-orm';
import { db } from '@/db/index';
import { RoleTable } from '@/features/master-data/role/role.model';
import { AdminTable } from '@/features/admin/admin.model';
import { AdminRoleTable } from '@/features/admin-role/admin-role.model';
import { logger } from '@/util/logger';

const DEFAULT_ROLES = ['admin', 'agency', 'pr', 'outlet'] as const;
const ACTOR = 'system';

async function ensureRole(roleName: string): Promise<string> {
  const existing = await db
    .select({ id: RoleTable.id })
    .from(RoleTable)
    .where(eq(RoleTable.roleName, roleName))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [created] = await db
    .insert(RoleTable)
    .values({
      roleName,
      status: 'active',
      createdBy: ACTOR,
      updatedBy: ACTOR,
    })
    .returning({ id: RoleTable.id });

  logger.info(`Default role created: ${roleName}`);
  return created.id;
}

async function assignAdminRole(adminEmail: string, roleId: string): Promise<void> {
  const admin = await db
    .select({ id: AdminTable.id })
    .from(AdminTable)
    .where(eq(AdminTable.email, adminEmail))
    .limit(1);

  if (admin.length === 0) {
    return;
  }

  const existing = await db
    .select({ id: AdminRoleTable.id })
    .from(AdminRoleTable)
    .where(and(eq(AdminRoleTable.adminId, admin[0].id), eq(AdminRoleTable.roleId, roleId)))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  await db.insert(AdminRoleTable).values({
    adminId: admin[0].id,
    roleId,
    status: 'active',
    createdBy: ACTOR,
    updatedBy: ACTOR,
  });

  logger.info(`Assigned "${adminEmail}" to admin role`);
}

export async function initRoles(): Promise<void> {
  const roleIds: Record<string, string> = {};

  for (const roleName of DEFAULT_ROLES) {
    roleIds[roleName] = await ensureRole(roleName);
  }

  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL;
  if (defaultAdminEmail && roleIds.admin) {
    await assignAdminRole(defaultAdminEmail, roleIds.admin);
  }

  logger.info(`Default roles ready: ${DEFAULT_ROLES.join(', ')}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initRoles()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Failed to seed default roles', error);
      process.exit(1);
    });
}
