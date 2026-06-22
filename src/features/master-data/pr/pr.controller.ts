import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '@/db/index';
import { PrRepositoryClass } from './pr.repository';
import { UserRepositoryClass } from '@/features/user/user.repository';
import { CreateUserSchema } from '@/features/user/user.schema';
import { buildUserInsert } from '@/features/user/user.util';
import { paginate } from '@/util/pagination';
import { paramId } from '@/util/params';
import { getActor } from '@/util/actor';
import { Error } from '@/error/index';

const JsonRecordSchema = z.record(z.string(), z.unknown());

const PrCreateSchema = z.object({
  user: CreateUserSchema,
  icNo: z.string().min(1).max(20),
  prNo: z.string().min(1).max(20),
  prAgency: z.uuid(),
  profileImage: z.string().optional(),
  comcardImages: JsonRecordSchema,
  language: z.array(z.string()).default([]),
  bwhMeasurements: JsonRecordSchema,
  status: z.string().default('pending_review'),
});

const PrUpdateSchema = z.object({
  icNo: z.string().min(1).max(20).optional(),
  prNo: z.string().min(1).max(20).optional(),
  prAgency: z.uuid().optional(),
  profileImage: z.string().optional(),
  comcardImages: JsonRecordSchema.optional(),
  language: z.array(z.string()).optional(),
  bwhMeasurements: JsonRecordSchema.optional(),
  status: z.string().optional(),
});

export class PrControllerClass {
  constructor(
    private prRepository: PrRepositoryClass,
    private userRepository: UserRepositoryClass,
  ) {}

  async list(req: Request, res: Response) {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 10);
      const data = await this.prRepository.list({
        icNo: req.query.icNo as string | undefined,
        prNo: req.query.prNo as string | undefined,
        status: req.query.status as string | undefined,
        userId: req.query.userId as string | undefined,
        prAgency: req.query.prAgency as string | undefined,
      });
      
      res.status(200).json({ success: true, message: 'OK', ...paginate(data, page, pageSize) });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const row = await this.prRepository.getById(paramId(req.params.id));
      if (!row) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      res.status(200).json({ success: true, message: 'OK', data: row });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsed = PrCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message, data: null });
      }

      const existingUser = await this.userRepository.getByEmail(parsed.data.user.email);
      if (existingUser) {
        return res.status(409).json({ success: false, message: Error.CONFLICT, data: null });
      }

      const existing = await this.prRepository.getByIcNo(parsed.data.icNo);
      if (existing) {
        return res.status(409).json({ success: false, message: 'IC number already registered', data: null });
      }

      const actor = getActor(req);
      const { user: _user, ...prFields } = parsed.data;
      const data = await db.transaction(async (tx) => {
        const user = await this.userRepository.create(buildUserInsert(parsed.data.user, actor), tx);
        return this.prRepository.create(
          {
            ...prFields,
            userId: user.id,
            createdBy: actor,
            updatedBy: actor,
          },
          tx,
        );
      });

      res.status(201).json({ success: true, message: 'PR created', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const parsed = PrUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message, data: null });
      }

      const id = paramId(req.params.id);

      if (parsed.data.icNo) {
        const existing = await this.prRepository.getByIcNo(parsed.data.icNo, id);
        if (existing) {
          return res.status(409).json({ success: false, message: 'IC number already registered', data: null });
        }
      }

      const data = await this.prRepository.update(id, {
        ...parsed.data,
        updatedBy: getActor(req),
      });
      if (!data) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      res.status(200).json({ success: true, message: 'PR updated', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const data = await this.prRepository.deactivate(paramId(req.params.id), getActor(req));
      if (!data) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      res.status(200).json({ success: true, message: 'PR deactivated', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }
}
