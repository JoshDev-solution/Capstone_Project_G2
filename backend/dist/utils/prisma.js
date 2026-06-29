"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
let databaseUrl = process.env.DATABASE_URL || '';
if (databaseUrl && !databaseUrl.includes('connection_limit')) {
    databaseUrl = databaseUrl.includes('?') ? `${databaseUrl}&connection_limit=5&connect_timeout=30` : `${databaseUrl}?connection_limit=5&connect_timeout=30`;
}
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});
exports.default = prisma;
