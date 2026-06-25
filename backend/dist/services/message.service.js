"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = exports.MessageService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class MessageService {
    async getInbox(userId) {
        const messages = await prisma_1.default.message.findMany({
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
            }
            else {
                if (msg.receiverId === userId && !msg.isRead) {
                    conversationsMap.get(otherUser.id).unreadCount++;
                }
            }
        }
        return Array.from(conversationsMap.values());
    }
    async getConversation(userId, otherUserId) {
        // Mark messages as read
        await prisma_1.default.message.updateMany({
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
        return await prisma_1.default.message.findMany({
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
    async sendMessage(senderId, receiverId, body) {
        return await prisma_1.default.message.create({
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
exports.MessageService = MessageService;
exports.messageService = new MessageService();
