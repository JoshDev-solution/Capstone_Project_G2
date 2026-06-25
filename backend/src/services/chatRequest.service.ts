import prisma from '../utils/prisma';

export class ChatRequestService {

  /**
   * Client creates a chat request to a vet/manager.
   * REQ181: Request a direct chat with a veterinarian or manager.
   */
  async createRequest(clientUserId: number, vetUserId: number, reason?: string, escalatedFromBot = false) {
    // Check if there's already a pending/approved request between these two
    const existing = await prisma.chatRequest.findFirst({
      where: {
        clientUserId,
        vetUserId,
        status: { in: ['Pending', 'Approved'] }
      }
    });

    if (existing) return existing;

    return await prisma.chatRequest.create({
      data: {
        clientUserId,
        vetUserId,
        reason,
        escalatedFromBot,
      },
      include: {
        clientUser: { select: { id: true, firstName: true, lastName: true, email: true, role: { select: { name: true } } } },
        vetUser: { select: { id: true, firstName: true, lastName: true, email: true, role: { select: { name: true } } } },
      }
    });
  }

  /**
   * REQ087: Vet accepts a chat request.
   */
  async acceptRequest(chatRequestId: number, vetUserId: number) {
    const request = await prisma.chatRequest.findUnique({ where: { id: chatRequestId } });
    if (!request) throw new Error('Chat request not found');
    if (request.vetUserId !== vetUserId) throw new Error('Not authorized to accept this request');
    if (request.status !== 'Pending') throw new Error(`Request is already ${request.status}`);

    return await prisma.chatRequest.update({
      where: { id: chatRequestId },
      data: { status: 'Approved', resolvedAt: new Date() },
      include: {
        clientUser: { select: { id: true, firstName: true, lastName: true, email: true, role: { select: { name: true } } } },
        vetUser: { select: { id: true, firstName: true, lastName: true, email: true, role: { select: { name: true } } } },
      }
    });
  }

  /**
   * REQ088: Vet declines a chat request.
   */
  async declineRequest(chatRequestId: number, vetUserId: number, declineReason?: string) {
    const request = await prisma.chatRequest.findUnique({ where: { id: chatRequestId } });
    if (!request) throw new Error('Chat request not found');
    if (request.vetUserId !== vetUserId) throw new Error('Not authorized to decline this request');
    if (request.status !== 'Pending') throw new Error(`Request is already ${request.status}`);

    return await prisma.chatRequest.update({
      where: { id: chatRequestId },
      data: { status: 'Declined', declineReason, resolvedAt: new Date() },
      include: {
        clientUser: { select: { id: true, firstName: true, lastName: true, email: true, role: { select: { name: true } } } },
        vetUser: { select: { id: true, firstName: true, lastName: true, email: true, role: { select: { name: true } } } },
      }
    });
  }

  /**
   * REQ084: Vet views all chat requests (incoming).
   * REQ086: Filter to see escalated-from-bot requests.
   */
  async getVetRequests(vetUserId: number, filter?: 'all' | 'pending' | 'approved' | 'declined' | 'escalated') {
    const where: any = { vetUserId };
    
    if (filter === 'pending') where.status = 'Pending';
    else if (filter === 'approved') where.status = 'Approved';
    else if (filter === 'declined') where.status = 'Declined';
    else if (filter === 'escalated') where.escalatedFromBot = true;

    return await prisma.chatRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        clientUser: { 
          select: { 
            id: true, firstName: true, lastName: true, email: true,
            role: { select: { name: true } },
            client: { select: { id: true, clientCode: true } }
          } 
        },
        vetUser: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
        _count: { select: { messages: true } }
      }
    });
  }

  /**
   * REQ182: Client views status of their chat requests.
   */
  async getClientRequests(clientUserId: number) {
    return await prisma.chatRequest.findMany({
      where: { clientUserId },
      orderBy: { createdAt: 'desc' },
      include: {
        vetUser: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
        _count: { select: { messages: true } }
      }
    });
  }

  /**
   * REQ085: View full conversation log (messages) for a specific chat request.
   */
  async getConversation(chatRequestId: number, userId: number) {
    const request = await prisma.chatRequest.findUnique({ where: { id: chatRequestId } });
    if (!request) throw new Error('Chat request not found');
    if (request.clientUserId !== userId && request.vetUserId !== userId) {
      throw new Error('Not authorized to view this conversation');
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        chatRequestId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true, readAt: new Date() }
    });

    return await prisma.message.findMany({
      where: { chatRequestId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
      }
    });
  }

  /**
   * REQ089 / REQ183: Send a message within an approved chat request.
   */
  async sendMessage(chatRequestId: number, senderId: number, body: string) {
    const request = await prisma.chatRequest.findUnique({ where: { id: chatRequestId } });
    if (!request) throw new Error('Chat request not found');
    if (request.status !== 'Approved') throw new Error('Chat request has not been approved yet');
    if (request.clientUserId !== senderId && request.vetUserId !== senderId) {
      throw new Error('Not authorized to send messages in this conversation');
    }

    const receiverId = request.clientUserId === senderId ? request.vetUserId : request.clientUserId;

    return await prisma.message.create({
      data: {
        senderId,
        receiverId,
        chatRequestId,
        body,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
      }
    });
  }
}

export const chatRequestService = new ChatRequestService();
