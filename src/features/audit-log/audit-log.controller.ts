import { Request, Response } from 'express';
import { AuditLogRepositoryClass } from './audit.repository';
import { Error } from '@/error/index';
import { paramId } from '@/util/params';

export class AuditLogControllerClass {
  constructor(private auditLogRepository: AuditLogRepositoryClass) {}

  async list(req: Request, res: Response) {
    try {
      const result = await this.auditLogRepository.getAuditLog(
        {
          dateFrom: req.query.dateFrom as string | undefined,
          dateTo: req.query.dateTo as string | undefined,
          userId: req.query.userId as string | undefined,
          role: req.query.role as string | undefined,
          entity: req.query.entity as string | undefined,
          entityId: req.query.entityId as string | undefined,
          action: req.query.action as string | undefined,
        },
        {
          pageSize: Number(req.query.pageSize ?? 10),
          pageNumber: Number(req.query.page ?? req.query.pageNumber ?? 1),
        },
        undefined,
        req.query.sortField
          ? {
              field: req.query.sortField as 'CREATED_AT' | 'ACTION' | 'ENTITY' | 'USER_NAME',
              direction: (req.query.sortDirection as 'ASC' | 'DESC' | undefined) ?? 'DESC',
            }
          : undefined,
      );
      res.status(200).json({ success: true, message: 'OK', ...result });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const row = await this.auditLogRepository.getById(Number(paramId(req.params.id)));
      if (!row) return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      res.status(200).json({ success: true, message: 'OK', data: row });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async listActions(_req: Request, res: Response) {
    try {
      const data = await this.auditLogRepository.getDistinctActions();
      res.status(200).json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async listEntities(_req: Request, res: Response) {
    try {
      const data = await this.auditLogRepository.getDistinctEntities();
      res.status(200).json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async listRoles(_req: Request, res: Response) {
    try {
      const data = await this.auditLogRepository.getDistinctRoles();
      res.status(200).json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }
}
