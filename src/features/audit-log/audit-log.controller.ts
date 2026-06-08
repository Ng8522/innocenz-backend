import { Request, Response } from 'express';
import { AuditLogRepositoryClass } from './audit-log.repository';
import { Error } from '@/error/index';

export class AuditLogControllerClass {
  constructor(private auditLogRepository: AuditLogRepositoryClass) {}

  async list(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit ?? 50);
      const data = await this.auditLogRepository.list(
        {
          userId: req.query.userId as string | undefined,
          entity: req.query.entity as string | undefined,
          action: req.query.action as string | undefined,
        },
        limit,
      );
      res.status(200).json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const row = await this.auditLogRepository.getById(Number(req.params.id));
      if (!row) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      res.status(200).json({ success: true, message: 'OK', data: row });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }
}
