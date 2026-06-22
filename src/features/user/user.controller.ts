import { Request, Response } from 'express';
import { UserRepositoryClass } from './user.repository';
import { UserFilter, UserSort, UserSortField } from './user.model';
import { omitPasswordHash } from './user.util';
import { Error } from '@/error/index';
import { paramId } from '@/util/params';

const SORT_FIELDS: UserSortField[] = ['CREATED_AT', 'UPDATED_AT', 'ACC_NAME', 'EMAIL', 'STATUS'];

export class UserControllerClass {
  constructor(private userRepository: UserRepositoryClass) {}

  async list(req: Request, res: Response) {
    try {
      const filter: UserFilter = {
        id: req.query.id as string | undefined,
        email: req.query.email as string | undefined,
        phoneNum: req.query.phoneNum as string | undefined,
        accName: req.query.accName as string | undefined,
        status: req.query.status as string | undefined,
        roleId: req.query.roleId as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      const sortField = req.query.sortField as UserSortField | undefined;
      const sort: UserSort | undefined =
        sortField && SORT_FIELDS.includes(sortField)
          ? {
              field: sortField,
              direction: (req.query.sortDirection as 'ASC' | 'DESC' | undefined) ?? 'DESC',
            }
          : undefined;

      const result = await this.userRepository.getUsers(
        filter,
        {
          pageSize: Number(req.query.pageSize ?? 10),
          pageNumber: Number(req.query.page ?? req.query.pageNumber ?? 1),
        },
        sort,
      );

      res.status(200).json({
        success: true,
        message: 'OK',
        data: result.query.map(omitPasswordHash),
        pagination: result.pagination,
      });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.getById(paramId(req.params.id));
      if (!user) {
        return res.status(404).json({ success: false, message: Error.NOT_FOUND, data: null });
      }
      res.status(200).json({ success: true, message: 'OK', data: omitPasswordHash(user) });
    } catch {
      res.status(500).json({ success: false, message: Error.INTERNAL_SERVER_ERROR, data: null });
    }
  }
}
