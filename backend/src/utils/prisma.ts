import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

let databaseUrl = process.env.DATABASE_URL || '';
if (databaseUrl && !databaseUrl.includes('connection_limit')) {
  databaseUrl = databaseUrl.includes('?') ? `${databaseUrl}&connection_limit=5&connect_timeout=30` : `${databaseUrl}?connection_limit=5&connect_timeout=30`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

export default prisma;
