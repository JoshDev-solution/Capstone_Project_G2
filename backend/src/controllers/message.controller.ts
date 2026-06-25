import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service';

export class MessageController {
  async getInbox(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const inbox = await messageService.getInbox(userId);
      res.json(inbox);
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const otherUserId = parseInt(req.params.userId);
      
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      if (isNaN(otherUserId)) return res.status(400).json({ message: 'Invalid user ID' });

      const messages = await messageService.getConversation(userId, otherUserId);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const senderId = req.user?.userId;
      const { receiverId, body } = req.body;
      
      if (!senderId) return res.status(401).json({ message: 'Unauthorized' });
      if (!receiverId || !body) return res.status(400).json({ message: 'receiverId and body are required' });

      const message = await messageService.sendMessage(senderId, parseInt(receiverId), body);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
