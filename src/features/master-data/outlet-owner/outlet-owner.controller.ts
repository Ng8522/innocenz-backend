import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '@/db/index';
import { OutletOwnerRepositoryClass } from './outlet-owner.repository';
import { UserRepositoryClass } from '@/features/user/user.repository';
import { CreateUserSchema } from '@/features/user/user.schema';
import { buildUserInsert } from '@/features/user/user.util';
import { paginate } from '@/util/pagination';
import { paramId } from '@/util/params';
import { getActor } from '@/util/actor';
import { Error } from '@/error/index';
import type { OutletOwnerRow } from './outlet-owner.repository';

function formatOutletOwner(row: OutletOwnerRow) {
  return {
    id: row.id,
    userId: row.userId,
    email: row.userEmail,
    name: row.userName,
    contactNo: row.userContactNo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

const OutletOwnerCreateSchema = z.object({
  user: CreateUserSchema,
});

export class OutletOwnerControllerClass {
  constructor(
    private outletOwnerRepository: OutletOwnerRepositoryClass,
    private userRepository: UserRepositoryClass,
  ) {}

  async list(req: Request, res: Response) {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 10);
      const data = await this.outletOwnerRepository.list();
      res.status(200).json({
        success: true,
        message: 'OK',
        ...paginate(data.map(formatOutletOwner), page, pageSize),
      });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const row = await this.outletOwnerRepository.getById(paramId(req.params.id));
      if (!row) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      res.status(200).json({ success: true, message: 'OK', data: formatOutletOwner(row) });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsed = OutletOwnerCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message, data: null });
      }

      const existingUser = await this.userRepository.getByEmail(parsed.data.user.email);
      if (existingUser) {
        const existingOwner = await this.outletOwnerRepository.getByUserId(existingUser.id);
        if (existingOwner) {
          return res.status(409).json({ success: false, message: 'User is already an outlet owner', data: null });
        }
        return res.status(409).json({ success: false, message: Error.CONFLICT, data: null });
      }

      const actor = getActor(req);
      let ownerId: string;
      await db.transaction(async (tx) => {
        const user = await this.userRepository.create(buildUserInsert(parsed.data.user, actor), tx);
        const owner = await this.outletOwnerRepository.create(
          { userId: user.id, createdBy: actor, updatedBy: actor },
          tx,
        );
        ownerId = owner.id;
      });

      const row = await this.outletOwnerRepository.getById(ownerId!);
      if (!row) {
        return res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
      }

      res.status(201).json({ success: true, message: 'Outlet owner created', data: formatOutletOwner(row) });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }
}
