import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Please configure it in Railway Variables.');
}

const url = new URL(databaseUrl);
const config = {
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  connectionLimit: 50,
  connectTimeout: 20000,
};
const adapter = new PrismaMariaDb(config as any);
const prisma = new PrismaClient({ adapter });

export default prisma;
