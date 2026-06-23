"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const mariadb_1 = __importDefault(require("mariadb"));
const pool = mariadb_1.default.createPool(process.env.DATABASE_URL);
const adapter = new adapter_mariadb_1.PrismaMariaDb(pool);
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
