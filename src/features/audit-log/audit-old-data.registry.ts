import { Request } from 'express';

type OldDataFetcher = (req: Request) => Promise<unknown | null>;

const registry = new Map<string, OldDataFetcher>();

export function registerAuditOldDataFetcher(entity: string, fetcher: OldDataFetcher): void {
  registry.set(entity, fetcher);
}

export async function fetchAuditOldData(entity: string, req: Request): Promise<unknown | null> {
  const fetcher = registry.get(entity);
  if (!fetcher) return null;
  return fetcher(req);
}
