import { Request, Response } from 'express';
import { z } from 'zod';
import { ModuleRepositoryClass } from './module.repository';
import { paginate } from '@/util/pagination';
import { paramId } from '@/util/params';
import { getActor } from '@/util/actor';
import { Error } from '@/error/index';
export class ModuleControllerClass {
  constructor(private moduleRepository: ModuleRepositoryClass) {}

}
