"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class DashboardService {
    async getAdminStats() {
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        // 1. Revenue Overview (Gross Revenue & Net Income per month)
        const paidBills = await prisma_1.default.bill.findMany({
            where: {
                status: 'Paid',
                createdAt: { gte: startDate, lte: endDate }
            },
            include: {
                items: {
                    include: { product: true }
                },
                refunds: true
            }
        });
        const grossRevenueData = new Array(12).fill(0);
        const netIncomeData = new Array(12).fill(0);
        for (const bill of paidBills) {
            const monthIndex = new Date(bill.createdAt).getMonth();
            const gross = Number(bill.totalAmount);
            let costOfGoods = 0;
            for (const item of bill.items) {
                if (item.productId && item.product?.costPrice) {
                    costOfGoods += Number(item.product.costPrice) * item.quantity;
                }
            }
            const totalRefunds = bill.refunds
                .filter((r) => r.status === 'Approved')
                .reduce((sum, r) => sum + Number(r.amount), 0);
            grossRevenueData[monthIndex] += gross;
            netIncomeData[monthIndex] += (gross - costOfGoods - totalRefunds);
        }
        // 2. Weekly Sales (Products sold Mon-Sun of current week)
        const curr = new Date();
        const firstday = new Date(curr.setDate(curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1))); // Monday
        firstday.setHours(0, 0, 0, 0);
        const lastday = new Date(firstday);
        lastday.setDate(lastday.getDate() + 6); // Sunday
        lastday.setHours(23, 59, 59, 999);
        const weeklyBillItems = await prisma_1.default.billItem.findMany({
            where: {
                productId: { not: null },
                bill: {
                    status: 'Paid',
                    createdAt: { gte: firstday, lte: lastday }
                }
            },
            include: { bill: true }
        });
        const salesData = new Array(7).fill(0);
        for (const item of weeklyBillItems) {
            // 0 = Sunday, 1 = Monday. We want 0=Mon, 6=Sun
            let dayIndex = new Date(item.bill.createdAt).getDay() - 1;
            if (dayIndex === -1)
                dayIndex = 6;
            salesData[dayIndex] += item.quantity;
        }
        // 3. Top Services
        const serviceItems = await prisma_1.default.billItem.findMany({
            where: {
                serviceId: { not: null },
                bill: { status: 'Paid' }
            },
            include: { service: true }
        });
        const serviceMap = new Map();
        for (const item of serviceItems) {
            const name = item.service?.category || 'General';
            serviceMap.set(name, (serviceMap.get(name) || 0) + Number(item.totalPrice));
        }
        const sortedServices = Array.from(serviceMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
        const servicesLabels = sortedServices.map(s => s[0]);
        const servicesRevenue = sortedServices.map(s => s[1]);
        // 4. Low Stock Alerts
        const products = await prisma_1.default.product.findMany({
            where: { isActive: true },
            include: { inventory: true }
        });
        const lowStockItems = products
            .filter((p) => p.inventory && p.inventory.quantity <= p.inventory.reorderLevel)
            .sort((a, b) => (a.inventory?.quantity || 0) - (b.inventory?.quantity || 0))
            .slice(0, 5)
            .map((p) => {
            const qty = p.inventory?.quantity || 0;
            const reorder = p.inventory?.reorderLevel || 10;
            const critical = qty <= reorder * 0.5;
            return {
                id: p.id,
                name: p.name,
                stock: qty,
                reorderLevel: reorder,
                status: critical ? 'Critical' : 'Low'
            };
        });
        // 5. Recent Activity (Synthesized from payments, users, refunds)
        const recentPayments = await prisma_1.default.payment.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { bill: { include: { client: { include: { user: true } } } } } });
        const recentUsers = await prisma_1.default.user.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
        const recentRefunds = await prisma_1.default.refund.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { bill: { include: { client: { include: { user: true } } } } } });
        let activities = [];
        recentPayments.forEach((p) => {
            activities.push({
                id: `p-${p.id}`,
                type: 'Payment received',
                user: p.bill?.client?.user?.firstName ? `${p.bill.client.user.firstName} ${p.bill.client.user.lastName}` : 'Client',
                detail: `₱${Number(p.amount).toLocaleString()}`,
                date: p.createdAt,
                color: 'success'
            });
        });
        recentUsers.forEach((u) => {
            activities.push({
                id: `u-${u.id}`,
                type: 'New registration',
                user: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
                detail: '',
                date: u.createdAt,
                color: 'primary'
            });
        });
        recentRefunds.forEach((r) => {
            activities.push({
                id: `r-${r.id}`,
                type: 'Refund request',
                user: r.bill?.client?.user?.firstName ? `${r.bill.client.user.firstName} ${r.bill.client.user.lastName}` : 'Client',
                detail: `₱${Number(r.amount).toLocaleString()}`,
                date: r.createdAt,
                color: 'warning'
            });
        });
        lowStockItems.forEach((l) => {
            activities.push({
                id: `l-${l.id}`,
                type: 'Low stock alert',
                user: l.name,
                detail: '',
                date: new Date(),
                color: 'danger'
            });
        });
        activities.sort((a, b) => b.date.getTime() - a.date.getTime());
        activities = activities.slice(0, 6);
        return {
            revenueData: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                gross: grossRevenueData,
                net: netIncomeData
            },
            salesData: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                data: salesData
            },
            servicesData: {
                labels: servicesLabels.length ? servicesLabels : ["No Data"],
                data: servicesRevenue.length ? servicesRevenue : [1]
            },
            lowStockItems,
            recentActivity: activities
        };
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
