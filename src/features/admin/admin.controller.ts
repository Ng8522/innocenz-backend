import { Request, Response } from 'express';
import { z } from 'zod';
import { AdminRepositoryClass } from './admin.repository';
import { hashPassword } from '@/util/password';
import { paginate } from '@/util/pagination';
import { Error } from '@/error/index';
import { paramId } from '@/util/params';

function omitPassword<T extends { password?: string }>(admin: T) {
  const { password: _, ...rest } = admin;
  return rest;
}

const CreateAdminSchema = z.object({
  email: z.email(),
  displayName: z.string().min(1).max(100),
  password: z.string().min(6),
  status: z.string().default('active'),
});

const UpdateAdminSchema = z.object({
  email: z.email().optional(),
  displayName: z.string().min(1).max(100).optional(),
  password: z.string().min(6).optional(),
  status: z.string().optional(),
});

export class AdminControllerClass {
  constructor(private adminRepository: AdminRepositoryClass) {}

  async list(req: Request, res: Response) {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 10);
      const admins = await this.adminRepository.list({
        email: req.query.email as string | undefined,
        status: req.query.status as string | undefined,
      });
      const result = paginate(admins.map(omitPassword), page, pageSize);
      res.status(200).json({ success: true, message: 'OK', ...result });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const admin = await this.adminRepository.getById(paramId(req.params.id));
      if (!admin) {
        return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      }
      res.status(200).json({ success: true, message: 'OK', data: omitPassword(admin) });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsed = CreateAdminSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message, data: null });
      }

      const existing = await this.adminRepository.getByEmail(parsed.data.email);
      if (existing) {
        return res.status(409).json({ success: false, message: Error.USER_ALREADY_EXISTS, data: null });
      }

      const passwordHash = await hashPassword(parsed.data.password);
      const admin = await this.adminRepository.create({
        email: parsed.data.email,
        displayName: parsed.data.displayName,
        password: passwordHash,
        status: parsed.data.status,
        createdBy: 'system',
        updatedBy: 'system',
      });

      res.status(201).json({ success: true, message: 'Admin created', data: omitPassword(admin) });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const parsed = UpdateAdminSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message, data: null });
      }

      const updateData: Record<string, unknown> = { ...parsed.data, updatedBy: 'system' };
      if (parsed.data.password) {
        updateData.password = await hashPassword(parsed.data.password);
      }

      const admin = await this.adminRepository.update(paramId(req.params.id), updateData);
      if (!admin) {
        return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      }

      res.status(200).json({ success: true, message: 'Admin updated', data: omitPassword(admin) });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const admin = await this.adminRepository.delete(
        paramId(req.params.id),
        req.admin?.email ?? 'system',
      );
      if (!admin) {
        return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      }
      res.status(200).json({ success: true, message: 'Admin deactivated', data: omitPassword(admin) });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }
}
