import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@goods.com' },
    update: {},
    create: {
      email: 'admin@goods.com',
      name: 'Admin User',
      password: 'admin123',
      role: 'ADMIN',
      phone: '0000000000',
      city: 'Admin City'
    }
  })
  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
