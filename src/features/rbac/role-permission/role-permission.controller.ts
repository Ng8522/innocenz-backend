import { Request, Response } from 'express';
import { z } from 'zod';
import { RolePermissionRepositoryClass } from './role-permission.repository';
import { paramId } from '@/util/params';
import { getActor } from '@/util/actor';
import { Error } from '@/error/index';

const RolePermissionSchema = z.object({
  roleId: z.uuid(),
  permissionId: z.uuid(),
});

const SyncRolePermissionSchema = z.object({
  permissionIds: z.array(z.uuid()),
});

export class RolePermissionControllerClass {
  constructor(private rolePermissionRepository: RolePermissionRepositoryClass) {}

  async list(req: Request, res: Response) {
    try {
      const data = await this.rolePermissionRepository.list({
        roleId: req.query.roleId as string | undefined,
        permissionId: req.query.permissionId as string | undefined,
      });
      res.status(200).json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const row = await this.rolePermissionRepository.getById(paramId(req.params.id));
      if (!row) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      res.status(200).json({ success: true, message: 'OK', data: row });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsed = RolePermissionSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      const data = await this.rolePermissionRepository.create({
        ...parsed.data,
        createdBy: getActor(req),
        updatedBy: getActor(req),
      });
      res.status(201).json({ success: true, message: 'Role permission created', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async sync(req: Request, res: Response) {
    try {
      const parsed = SyncRolePermissionSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
      const data = await this.rolePermissionRepository.sync(
        paramId(req.params.roleId),
        parsed.data.permissionIds,
        getActor(req),
      );
      res.status(200).json({ success: true, message: 'Role permissions synced', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const deleted = await this.rolePermissionRepository.remove(paramId(req.params.id));
      if (!deleted) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      res.status(200).json({ success: true, message: 'Role permission removed', data: null });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }
}
