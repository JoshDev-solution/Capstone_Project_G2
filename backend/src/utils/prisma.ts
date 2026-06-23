import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import mariadb from 'mariadb';

const pool = mariadb.createPool(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
