import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const url = new URL(process.env.DATABASE_URL!);
const config = {
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1)
};
const adapter = new PrismaMariaDb(config);
const prisma = new PrismaClient({ adapter });

export default prisma;
