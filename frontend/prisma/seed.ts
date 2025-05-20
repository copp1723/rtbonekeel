import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      apiKeys: {
        create: [
          {
            service: 'google_ads',
            keyName: 'Google Ads API Key',
            keyValue: 'gads-api-key-12345',
            label: 'Production Google Ads',
            additionalData: {
              clientId: '123456789',
              clientSecret: 'client-secret-123',
            },
          },
          {
            service: 'facebook_ads',
            keyName: 'Facebook Ads API Key',
            keyValue: 'fb-ads-api-key-67890',
            label: 'Facebook Marketing API',
          },
        ],
      },
    },
  });
  
  console.log({ user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
