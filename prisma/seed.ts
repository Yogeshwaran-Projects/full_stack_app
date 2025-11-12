import { PrismaClient ,user_role } from '@/lib/generated/prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin user...');
  const adminPhone = "1234567890"; 
  const adminPassword = "admin"; 
  const adminName = "admin";

  const existingAdmin = await prisma.users.findUnique({
    where: { phone_number: adminPhone }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.users.create({
      data: {
        phone_number: adminPhone,
        name: adminName,
        hashed_password: hashedPassword,
        role: user_role.admin
      }
    });
    console.log('✅ Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });