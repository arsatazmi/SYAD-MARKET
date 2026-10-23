import { db } from './db';

export async function getStoreSetting() {
  return db.storeSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

export async function getPublicCatalog() {
  return db.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      products: {
        where: { active: true },
        orderBy: [{ featured: 'desc' }, { createdAt: 'asc' }],
      },
    },
  });
}
