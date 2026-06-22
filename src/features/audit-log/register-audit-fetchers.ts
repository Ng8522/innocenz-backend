import {
  adminRepository,
  agencyRepository,
  agencyUserRepository,
  moduleRepository,
  outletRepository,
  permissionRepository,
  prRepository,
  rolePermissionRepository,
  roleRepository,
} from '@/composition-root';
import { registerAuditOldDataFetcher } from './audit-old-data.registry';
import { agencyUserKeysFromRequest, entityIdFromParams } from './audit.util';

function omitAdminPassword<T extends { password?: string | null }>(row: T) {
  const { password: _, ...rest } = row;
  return rest;
}

export function registerAllAuditOldDataFetchers(): void {
  registerAuditOldDataFetcher('Admin', async (req) => {
    const id = entityIdFromParams(req);
    if (!id) return null;
    const row = await adminRepository.getById(id);
    return row ? omitAdminPassword(row) : null;
  });

  registerAuditOldDataFetcher('Agency', async (req) => {
    const id = entityIdFromParams(req);
    if (!id) return null;
    return agencyRepository.getById(id);
  });

  registerAuditOldDataFetcher('AgencyUser', async (req) => {
    const keys = agencyUserKeysFromRequest(req);
    if (!keys) return null;
    return agencyUserRepository.getByKey(keys.agencyId, keys.userId);
  });

  registerAuditOldDataFetcher('PR', async (req) => {
    const id = entityIdFromParams(req);
    if (!id) return null;
    return prRepository.getById(id);
  });

  registerAuditOldDataFetcher('Outlet', async (req) => {
    const id = entityIdFromParams(req);
    if (!id) return null;
    return outletRepository.getById(id);
  });

  registerAuditOldDataFetcher('Role', async (req) => {
    const id = entityIdFromParams(req);
    if (!id) return null;
    return roleRepository.getById(id);
  });

  registerAuditOldDataFetcher('Module', async (req) => {
    const id = entityIdFromParams(req);
    if (!id) return null;
    return moduleRepository.getById(id);
  });

  registerAuditOldDataFetcher('Permission', async (req) => {
    const id = entityIdFromParams(req);
    if (!id) return null;
    return permissionRepository.getById(id);
  });

  registerAuditOldDataFetcher('RolePermission', async (req) => {
    const id = entityIdFromParams(req);
    if (!id) return null;
    return rolePermissionRepository.getById(id);
  });
}
