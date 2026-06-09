import type { AdminType } from '@/features/admin/admin.model';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminType;
      auditLogged?: boolean;
    }
  }
}

export {};
