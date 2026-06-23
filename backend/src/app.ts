import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import clientRoutes from './routes/client.routes';
import petRoutes from './routes/pet.routes';
import appointmentRoutes from './routes/appointment.routes';
import consultationRoutes from './routes/consultation.routes';
import medicalRecordRoutes from './routes/medicalRecord.routes';
import diagnosisRoutes from './routes/diagnosis.routes';
import prescriptionRoutes from './routes/prescription.routes';
import productRoutes from './routes/product.routes';
import inventoryRoutes from './routes/inventory.routes';
import discountRoutes from './routes/discount.routes';
import billRoutes from './routes/bill.routes';
import paymentRoutes from './routes/payment.routes';
import activityLogRoutes from './routes/activityLog.routes';
import auditLogRoutes from './routes/auditLog.routes';
import chatbotLogRoutes from './routes/chatbotLog.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import inventoryTransactionRoutes from './routes/inventoryTransaction.routes';
import reportRoutes from './routes/report.routes';
import serviceRoutes from './routes/service.routes';
import refundRoutes from './routes/refund.routes';

import path from 'path';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Basic health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/chatbot-logs', chatbotLogRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/inventory-transactions', inventoryTransactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/refunds', refundRoutes);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

export default app;
