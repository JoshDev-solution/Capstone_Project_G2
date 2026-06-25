import prisma from './src/utils/prisma';

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      profileImageUrl: {
        startsWith: '/uploads/'
      }
    },
    data: {
      profileImageUrl: null
    }
  });
  console.log(`Cleaned up ${result.count} broken image paths`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
