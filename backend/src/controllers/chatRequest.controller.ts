import { Request, Response, NextFunction } from 'express';
import { chatRequestService } from '../services/chatRequest.service';

export class ChatRequestController {

  /** Client creates a chat request to a vet (REQ181) */
  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const clientUserId = req.user?.userId;
      if (!clientUserId) return res.status(401).json({ message: 'Unauthorized' });

      const { vetUserId, reason, escalatedFromBot } = req.body;
      if (!vetUserId) return res.status(400).json({ message: 'vetUserId is required' });

      const request = await chatRequestService.createRequest(
        clientUserId, parseInt(vetUserId), reason, escalatedFromBot || false
      );
      res.status(201).json(request);
    } catch (error: any) {
      if (error.message) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  /** Vet accepts a chat request (REQ087) */
  async acceptRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const vetUserId = req.user?.userId;
      if (!vetUserId) return res.status(401).json({ message: 'Unauthorized' });

      const chatRequestId = parseInt(req.params.id as string);
      const result = await chatRequestService.acceptRequest(chatRequestId, vetUserId);
      res.json(result);
    } catch (error: any) {
      if (error.message) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  /** Vet declines a chat request (REQ088) */
  async declineRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const vetUserId = req.user?.userId;
      if (!vetUserId) return res.status(401).json({ message: 'Unauthorized' });

      const chatRequestId = parseInt(req.params.id as string);
      const { declineReason } = req.body;
      const result = await chatRequestService.declineRequest(chatRequestId, vetUserId, declineReason);
      res.json(result);
    } catch (error: any) {
      if (error.message) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  /** Vet views all chat requests (REQ084, REQ086) */
  async getVetRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const vetUserId = req.user?.userId;
      if (!vetUserId) return res.status(401).json({ message: 'Unauthorized' });

      const filter = req.query.filter as 'all' | 'pending' | 'approved' | 'declined' | 'escalated' | undefined;
      const requests = await chatRequestService.getVetRequests(vetUserId, filter || 'all');
      res.json(requests);
    } catch (error) {
      next(error);
    }
  }

  /** Client views their chat requests (REQ182) */
  async getClientRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const clientUserId = req.user?.userId;
      if (!clientUserId) return res.status(401).json({ message: 'Unauthorized' });

      const requests = await chatRequestService.getClientRequests(clientUserId);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  }

  /** View conversation messages for a chat request (REQ085, REQ184) */
  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const chatRequestId = parseInt(req.params.id as string);
      const messages = await chatRequestService.getConversation(chatRequestId, userId);
      res.json(messages);
    } catch (error: any) {
      if (error.message) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  /** Send a message in an approved chat request (REQ089, REQ183) */
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const senderId = req.user?.userId;
      if (!senderId) return res.status(401).json({ message: 'Unauthorized' });

      const chatRequestId = parseInt(req.params.id as string);
      const { body } = req.body;
      if (!body) return res.status(400).json({ message: 'Message body is required' });

      const message = await chatRequestService.sendMessage(chatRequestId, senderId, body);
      res.status(201).json(message);
    } catch (error: any) {
      if (error.message) return res.status(400).json({ message: error.message });
      next(error);
    }
  }
}

export const chatRequestController = new ChatRequestController();
