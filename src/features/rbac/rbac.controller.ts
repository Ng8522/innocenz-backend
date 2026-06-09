import { Request, Response } from 'express';
import { RolePermissionRepositoryClass } from '@/features/rbac/role-permission/role-permission.repository';
import { Error } from '@/error/index';

export class RbacControllerClass {
  constructor(private rolePermissionRepository: RolePermissionRepositoryClass) {}

  async getMyAccess(req: Request, res: Response) {
    try {
      if (!req.admin) {
        return res.status(401).json({ success: false, message: Error.UNAUTHORIZED, data: null });
      }

      const data = await this.rolePermissionRepository.getPermissionsByRoleName('admin');
      res.status(200).json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }
}
