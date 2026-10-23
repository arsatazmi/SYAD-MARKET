import type { Prisma } from '@prisma/client';

export async function writeAudit(
  tx: Prisma.TransactionClient,
  actorId: string,
  action: string,
  entity: string,
  entityId?: string,
  detail?: string,
) {
  await tx.auditLog.create({
    data: { actorId, action, entity, entityId, detail },
  });
}
