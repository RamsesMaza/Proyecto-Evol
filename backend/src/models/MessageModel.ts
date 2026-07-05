import { prisma } from '../lib/prisma';

export const MessageModel = {

  async send(data: { senderId: number; receiverId?: number; subject?: string; body: string; parentId?: number }) {
    return prisma.message.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId || null,
        subject: data.subject || null,
        body: data.body,
        parentId: data.parentId || null,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  },

  async getConversations(userId: number) {
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    const grouped: Record<string, { user: any; lastMessage: any; unread: number }> = {};
    for (const m of messages) {
      const otherId = m.senderId === userId ? m.receiverId : m.senderId;
      if (!otherId) continue;
      const key = String(otherId);
      if (!grouped[key]) {
        const other = m.senderId === userId ? m.receiver : m.sender;
        grouped[key] = { user: other, lastMessage: m, unread: 0 };
      }
      if (!m.read && m.receiverId === userId) grouped[key].unread++;
    }
    return Object.values(grouped).sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
  },

  async getThread(userId: number, otherUserId: number) {
    return prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  },

  async markRead(userId: number, senderId: number) {
    await prisma.message.updateMany({
      where: { senderId, receiverId: userId, read: false },
      data: { read: true },
    });
  },

  async getUnreadCount(userId: number) {
    return prisma.message.count({ where: { receiverId: userId, read: false } });
  },

  async listAuditors() {
    return prisma.user.findMany({
      where: { role: 'AUDITOR' },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
  },
};
