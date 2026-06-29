"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
// Append connection limits to DATABASE_URL if not already present
let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('connection_limit')) {
    process.env.DATABASE_URL = dbUrl.includes('?')
        ? `${dbUrl}&connection_limit=5&connect_timeout=30`
        : `${dbUrl}?connection_limit=5&connect_timeout=30`;
}
const prisma = new client_1.PrismaClient();
exports.default = prisma;
