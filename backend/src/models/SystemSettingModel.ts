import { prisma } from '../lib/prisma';

export const SystemSettingModel = {
  async get(key: string) {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    return setting?.value ?? null;
  },

  async getAll() {
    const settings = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value ?? '';
    return map;
  },

  async set(key: string, value: string) {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  },

  async setMany(data: Record<string, string>) {
    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value);
    }
    return this.getAll();
  },

  async delete(key: string) {
    return prisma.systemSetting.delete({ where: { key } });
  },
};
