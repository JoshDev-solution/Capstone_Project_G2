const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const roles = await p.role.findMany();
  console.log('ROLES:', JSON.stringify(roles));

  const users = await p.user.findMany({ include: { role: true } });
  console.log('USERS:', users.map(x => ({ id: x.id, email: x.email, roleName: x.role.name })));
}

main().catch(console.error).finally(() => p.$disconnect());
