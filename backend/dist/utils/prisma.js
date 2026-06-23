"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const url = new URL(process.env.DATABASE_URL);
const config = {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1)
};
const adapter = new adapter_mariadb_1.PrismaMariaDb(config);
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
