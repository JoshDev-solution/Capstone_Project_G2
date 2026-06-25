import { Router } from 'express';
import { chatRequestController } from '../controllers/chatRequest.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Client routes
router.post('/', chatRequestController.createRequest);               // REQ181: Create a chat request
router.get('/my-requests', chatRequestController.getClientRequests);  // REQ182: View own request statuses

// Vet routes
router.get('/vet-inbox', chatRequestController.getVetRequests);       // REQ084/086: View all incoming requests
router.patch('/:id/accept', chatRequestController.acceptRequest);     // REQ087: Accept a request
router.patch('/:id/decline', chatRequestController.declineRequest);   // REQ088: Decline a request

// Shared conversation routes
router.get('/:id/messages', chatRequestController.getConversation);   // REQ085/184: View conversation
router.post('/:id/messages', chatRequestController.sendMessage);      // REQ089/183: Send message

export default router;
