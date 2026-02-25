import { PrismaClient, UserRole, AssetMediaType, AssetStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [admin, seller, buyer] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@prosets.dev' },
      update: { role: UserRole.ADMIN, name: 'Admin Demo' },
      create: {
        email: 'admin@prosets.dev',
        name: 'Admin Demo',
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'seller@prosets.dev' },
      update: { role: UserRole.SELLER, name: 'Seller Demo' },
      create: {
        email: 'seller@prosets.dev',
        name: 'Seller Demo',
        role: UserRole.SELLER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'buyer@prosets.dev' },
      update: { role: UserRole.BUYER, name: 'Buyer Demo' },
      create: {
        email: 'buyer@prosets.dev',
        name: 'Buyer Demo',
        role: UserRole.BUYER,
      },
    }),
  ]);

  const categories = await Promise.all(
    ['3D', 'Snippets', 'Templates'].map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const demoAssets = [
    {
      title: 'Low Poly Spaceship',
      description: 'Game-ready spaceship asset with textures.',
      priceCents: 3900,
      categoryId: categories[0].id,
      mediaUrl: 'https://images.unsplash.com/photo-1636819488524-1f019c4e1c44',
    },
    {
      title: 'Cyberpunk Character Rig',
      description: 'Rigged humanoid with clean topology.',
      priceCents: 5900,
      categoryId: categories[0].id,
      mediaUrl: 'https://images.unsplash.com/photo-1635776063043-ab23b4c226f6',
    },
    {
      title: 'JWT Auth Starter',
      description: 'Auth snippet with role middleware.',
      priceCents: 1900,
      categoryId: categories[1].id,
      mediaUrl: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3',
    },
    {
      title: 'Next.js Dashboard Kit',
      description: 'UI blocks for SaaS dashboard pages.',
      priceCents: 4900,
      categoryId: categories[2].id,
      mediaUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    },
    {
      title: 'Portfolio Landing Template',
      description: 'Minimal portfolio template with animations.',
      priceCents: 2900,
      categoryId: categories[2].id,
      mediaUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6',
    },
  ];

  for (const demo of demoAssets) {
    const existing = await prisma.asset.findFirst({
      where: { title: demo.title, sellerId: seller.id },
    });

    const asset =
      existing ??
      (await prisma.asset.create({
        data: {
          title: demo.title,
          description: demo.description,
          priceCents: demo.priceCents,
          currency: 'usd',
          status: AssetStatus.ACTIVE,
          categoryId: demo.categoryId,
          sellerId: seller.id,
        },
      }));

    const existingMedia = await prisma.assetMedia.findFirst({
      where: { assetId: asset.id, url: demo.mediaUrl },
    });
    if (!existingMedia) {
      await prisma.assetMedia.create({
        data: {
          assetId: asset.id,
          type: AssetMediaType.IMAGE,
          url: demo.mediaUrl,
        },
      });
    }
  }

  console.log('Seed complete:', {
    admin: admin.email,
    seller: seller.email,
    buyer: buyer.email,
    categories: categories.map((c) => c.name),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
