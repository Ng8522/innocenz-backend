import { Request, Response } from 'express';
import { z } from 'zod';
import { RbacRepositoryClass } from './rbac.repository';
import { paginate } from '@/util/pagination';
import { Error } from '@/error/index';
import { paramId } from '@/util/params';

const actor = 'system';

const RoleSchema = z.object({
  roleName: z.string().min(1).max(100),
  status: z.string().default('active'),
});

const ModuleSchema = z.object({
  moduleName: z.string().min(1).max(100),
  status: z.string().default('active'),
});

const PermissionSchema = z.object({
  moduleId: z.uuid(),
  permissionName: z.string().min(1).max(100),
  description: z.string().min(1).max(255),
  status: z.string().default('active'),
});

const RolePermissionSchema = z.object({
  roleId: z.uuid(),
  permissionId: z.uuid(),
});

const SyncRolePermissionSchema = z.object({
  permissionIds: z.array(z.uuid()),
});

const AdminRoleSchema = z.object({
  adminId: z.uuid(),
  roleId: z.uuid(),
  status: z.string().default('active'),
});

export class RbacControllerClass {
  constructor(private rbacRepository: RbacRepositoryClass) {}

  async getMyAccess(req: Request, res: Response) {
    try {
      const adminId = req.admin?.id;
      if (!adminId) {
        return res.status(401).json({ success: false, message: Error.UNAUTHORIZED, data: null });
      }
      const data = await this.rbacRepository.getAdminPermissions(adminId);
      res.status(200).json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  // Roles
  async listRoles(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const data = await this.rbacRepository.listRoles({
      roleName: req.query.roleName as string | undefined,
      status: req.query.status as string | undefined,
    });
    res.status(200).json({ success: true, message: 'OK', ...paginate(data, page, pageSize) });
  }

  async getRole(req: Request, res: Response) {
    const role = await this.rbacRepository.getRoleById(paramId(req.params.id));
    if (!role) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'OK', data: role });
  }

  async createRole(req: Request, res: Response) {
    const parsed = RoleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    const data = await this.rbacRepository.createRole({ ...parsed.data, createdBy: actor, updatedBy: actor });
    res.status(201).json({ success: true, message: 'Role created', data });
  }

  async updateRole(req: Request, res: Response) {
    const parsed = RoleSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    const data = await this.rbacRepository.updateRole(paramId(req.params.id), { ...parsed.data, updatedBy: actor });
    if (!data) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'Role updated', data });
  }

  async deleteRole(req: Request, res: Response) {
    const deleted = await this.rbacRepository.deleteRole(paramId(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'Role deleted', data: null });
  }

  // Modules
  async listModules(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const data = await this.rbacRepository.listModules({
      moduleName: req.query.moduleName as string | undefined,
      status: req.query.status as string | undefined,
    });
    res.status(200).json({ success: true, message: 'OK', ...paginate(data, page, pageSize) });
  }

  async getModule(req: Request, res: Response) {
    const row = await this.rbacRepository.getModuleById(paramId(req.params.id));
    if (!row) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'OK', data: row });
  }

  async createModule(req: Request, res: Response) {
    const parsed = ModuleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    const data = await this.rbacRepository.createModule({ ...parsed.data, createdBy: actor, updatedBy: actor });
    res.status(201).json({ success: true, message: 'Module created', data });
  }

  async updateModule(req: Request, res: Response) {
    const parsed = ModuleSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    const data = await this.rbacRepository.updateModule(paramId(req.params.id), { ...parsed.data, updatedBy: actor });
    if (!data) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'Module updated', data });
  }

  async deleteModule(req: Request, res: Response) {
    const deleted = await this.rbacRepository.deleteModule(paramId(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'Module deleted', data: null });
  }

  // Permissions
  async listPermissions(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const data = await this.rbacRepository.listPermissions({
      moduleId: req.query.moduleId as string | undefined,
      status: req.query.status as string | undefined,
    });
    res.status(200).json({ success: true, message: 'OK', ...paginate(data, page, pageSize) });
  }

  async getPermission(req: Request, res: Response) {
    const row = await this.rbacRepository.getPermissionById(paramId(req.params.id));
    if (!row) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'OK', data: row });
  }

  async createPermission(req: Request, res: Response) {
    const parsed = PermissionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    const data = await this.rbacRepository.createPermission({ ...parsed.data, createdBy: actor, updatedBy: actor });
    res.status(201).json({ success: true, message: 'Permission created', data });
  }

  async updatePermission(req: Request, res: Response) {
    const parsed = PermissionSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    const data = await this.rbacRepository.updatePermission(paramId(req.params.id), { ...parsed.data, updatedBy: actor });
    if (!data) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'Permission updated', data });
  }

  async deletePermission(req: Request, res: Response) {
    const deleted = await this.rbacRepository.deletePermission(paramId(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'Permission deleted', data: null });
  }

  // Role permissions
  async listRolePermissions(req: Request, res: Response) {
    const data = await this.rbacRepository.listRolePermissions({
      roleId: req.query.roleId as string | undefined,
      permissionId: req.query.permissionId as string | undefined,
    });
    res.status(200).json({ success: true, message: 'OK', data });
  }

  async createRolePermission(req: Request, res: Response) {
    const parsed = RolePermissionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    const data = await this.rbacRepository.createRolePermission({
      ...parsed.data,
      createdBy: actor,
      updatedBy: actor,
    });
    res.status(201).json({ success: true, message: 'Role permission created', data });
  }

  async syncRolePermissions(req: Request, res: Response) {
    const parsed = SyncRolePermissionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    const data = await this.rbacRepository.syncRolePermissions(paramId(req.params.roleId), parsed.data.permissionIds, actor);
    res.status(200).json({ success: true, message: 'Role permissions synced', data });
  }

  async deleteRolePermission(req: Request, res: Response) {
    const deleted = await this.rbacRepository.deleteRolePermission(paramId(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'Role permission deleted', data: null });
  }

  // Admin roles
  async listAdminRoles(req: Request, res: Response) {
    const data = await this.rbacRepository.listAdminRoles({
      adminId: req.query.adminId as string | undefined,
      roleId: req.query.roleId as string | undefined,
      status: req.query.status as string | undefined,
    });
    res.status(200).json({ success: true, message: 'OK', data });
  }

  async createAdminRole(req: Request, res: Response) {
    const parsed = AdminRoleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    const data = await this.rbacRepository.createAdminRole({ ...parsed.data, createdBy: actor, updatedBy: actor });
    res.status(201).json({ success: true, message: 'Admin role created', data });
  }

  async updateAdminRole(req: Request, res: Response) {
    const parsed = AdminRoleSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    const data = await this.rbacRepository.updateAdminRole(paramId(req.params.id), { ...parsed.data, updatedBy: actor });
    if (!data) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'Admin role updated', data });
  }

  async deleteAdminRole(req: Request, res: Response) {
    const deleted = await this.rbacRepository.deleteAdminRole(paramId(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
    res.status(200).json({ success: true, message: 'Admin role deleted', data: null });
  }
}
