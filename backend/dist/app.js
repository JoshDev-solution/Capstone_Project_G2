"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const pet_routes_1 = __importDefault(require("./routes/pet.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const consultation_routes_1 = __importDefault(require("./routes/consultation.routes"));
const medicalRecord_routes_1 = __importDefault(require("./routes/medicalRecord.routes"));
const diagnosis_routes_1 = __importDefault(require("./routes/diagnosis.routes"));
const prescription_routes_1 = __importDefault(require("./routes/prescription.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const discount_routes_1 = __importDefault(require("./routes/discount.routes"));
const bill_routes_1 = __importDefault(require("./routes/bill.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const activityLog_routes_1 = __importDefault(require("./routes/activityLog.routes"));
const auditLog_routes_1 = __importDefault(require("./routes/auditLog.routes"));
const chatbotLog_routes_1 = __importDefault(require("./routes/chatbotLog.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const inventoryTransaction_routes_1 = __importDefault(require("./routes/inventoryTransaction.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const refund_routes_1 = __importDefault(require("./routes/refund.routes"));
const chatRequest_routes_1 = __importDefault(require("./routes/chatRequest.routes"));
const setting_routes_1 = __importDefault(require("./routes/setting.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/clients', client_routes_1.default);
app.use('/api/pets', pet_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/consultations', consultation_routes_1.default);
app.use('/api/medical-records', medicalRecord_routes_1.default);
app.use('/api/diagnoses', diagnosis_routes_1.default);
app.use('/api/prescriptions', prescription_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/inventory', inventory_routes_1.default);
app.use('/api/discounts', discount_routes_1.default);
app.use('/api/bills', bill_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/activity-logs', activityLog_routes_1.default);
app.use('/api/audit-logs', auditLog_routes_1.default);
app.use('/api/chatbot-logs', chatbotLog_routes_1.default);
app.use('/api/messages', message_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/inventory-transactions', inventoryTransaction_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/services', service_routes_1.default);
app.use('/api/refunds', refund_routes_1.default);
app.use('/api/chat-requests', chatRequest_routes_1.default);
app.use('/api/settings', setting_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});
exports.default = app;
