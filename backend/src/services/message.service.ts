import prisma from '../utils/prisma';

export class MessageService {
  async getInbox(userId: number) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } }
      }
    });

    const conversationsMap = new Map();
    
    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationsMap.has(otherUser.id)) {
        conversationsMap.set(otherUser.id, {
          contact: otherUser,
          latestMessage: msg,
          unreadCount: msg.receiverId === userId && !msg.isRead ? 1 : 0
        });
      } else {
        if (msg.receiverId === userId && !msg.isRead) {
          conversationsMap.get(otherUser.id).unreadCount++;
        }
      }
    }

    return Array.from(conversationsMap.values());
  }

  async getConversation(userId: number, otherUserId: number) {
    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        receiverId: userId,
        senderId: otherUserId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ],
        isDeleted: false
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } }
      }
    });
  }

  async sendMessage(senderId: number, receiverId: number, body: string) {
    return await prisma.message.create({
      data: {
        senderId,
        receiverId,
        body
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } }
      }
    });
  }
}

export const messageService = new MessageService();
