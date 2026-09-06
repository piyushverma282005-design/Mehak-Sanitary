import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // 1. Bootstrap Admin Accounts
  const primaryAdminEmail = (process.env.ADMIN_EMAIL || 'admin@hariharindustries.com').toLowerCase();
  const businessAdminEmail = 'piyushverma282005@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Mehak@2026AdminSecret';

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const adminEmails = Array.from(new Set([primaryAdminEmail, businessAdminEmail]));

  for (const email of adminEmails) {
    const admin = await prisma.adminUser.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
      },
    });
    console.log(`✓ Admin user bootstrapped securely: ${admin.email}`);
  }

  // 2. Initial Categories
  const categoriesData = [
    {
      name: 'Health Faucets',
      slug: 'health-faucets',
      description: 'Ergonomic hand-held health faucet spray sets with pressure hoses and wall hooks.',
    },
    {
      name: 'Waste Couplings',
      slug: 'waste-couplings',
      description: 'Precision-machined waste couplings for wash basins and vanity counters.',
    },
    {
      name: 'Jali / Floor Jali',
      slug: 'floor-jali',
      description: 'Drainage floor jalis with anti-foul trap systems and cockroach repellency features.',
    },
    {
      name: 'Sink Couplings',
      slug: 'sink-couplings',
      description: 'Heavy-duty sink strainers and waste couplings for commercial and domestic sinks.',
    },
    {
      name: 'Jet Sprays',
      slug: 'jet-sprays',
      description: 'Toilet seat jet sprays designed for targeted water flow and easy mounting.',
    },
    {
      name: 'Waste Pipes',
      slug: 'waste-pipes',
      description: 'Flexible and rigid waste outlet pipes for wash basins, sinks, and washing machines.',
    },
    {
      name: 'Bathroom Accessories',
      slug: 'bathroom-accessories',
      description: 'Essential bath accessories including towel rods, soap dishes, robe hooks, and shelf racks.',
    },
    {
      name: 'Other Sanitary Hardware',
      slug: 'other-sanitary-hardware',
      description: 'Specialized plumbing connectors, extension nipples, valves, and hardware fittings.',
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: { name: catData.name, description: catData.description },
      create: catData,
    });
    categoryMap.set(catData.slug, category.id);
  }

  console.log(`✓ Created ${categoryMap.size} core categories`);

  // 3. Initial Generic Products
  const productsData = [
    {
      name: 'Health Faucet',
      slug: 'health-faucet',
      categorySlug: 'health-faucets',
      material: 'PTMT / Heavy Brass Body Options',
      shortDescription: 'Ergonomic hand-held health faucet spray with flexible pressure hose and wall hook.',
      description: 'The Mehak Health Faucet spray unit delivers soft aerated water control for modern bathrooms. Engineered with anti-clog spray holes, durable inner valve mechanisms, and a comfortable trigger handle for smooth daily operation.',
      featured: true,
      available: true,
      specifications: [
        { label: 'Category', value: 'Health Faucets' },
        { label: 'Brand', value: 'Mehak' },
        { label: 'Manufacturer', value: 'Hari Har Industries' },
      ],
    },
    {
      name: 'Waste Coupling',
      slug: 'waste-coupling',
      categorySlug: 'waste-couplings',
      material: 'Stainless Steel / Heavy Brass',
      shortDescription: 'Precision-machined waste coupling for wash basins and vanity counters.',
      description: 'Mehak Waste Couplings ensure leak-proof drainage for wash basins. Features precision threading, durable rubber seals, and corrosion-resistant surface finish for standard basin outlets.',
      featured: true,
      available: true,
      specifications: [
        { label: 'Category', value: 'Waste Couplings' },
        { label: 'Brand', value: 'Mehak' },
        { label: 'Manufacturer', value: 'Hari Har Industries' },
      ],
    },
    {
      name: 'Floor Jali',
      slug: 'floor-jali',
      categorySlug: 'floor-jali',
      material: 'Stainless Steel / PTMT Polymer',
      shortDescription: 'Heavy-duty floor drain jali with anti-foul trap and insect barrier.',
      description: 'Designed for bathroom and balcony water evacuation, the Mehak Floor Jali prevents hair blockage, foul odors, and drain pests while providing clean aesthetic integration with floor tiles.',
      featured: true,
      available: true,
      specifications: [
        { label: 'Category', value: 'Jali / Floor Jali' },
        { label: 'Brand', value: 'Mehak' },
        { label: 'Manufacturer', value: 'Hari Har Industries' },
      ],
    },
    {
      name: 'Sink Coupling',
      slug: 'sink-coupling',
      categorySlug: 'sink-couplings',
      material: 'Stainless Steel & Polymer',
      shortDescription: 'High-flow kitchen sink waste coupling with removable basket strainer.',
      description: 'Engineered for commercial and domestic kitchen sinks, Mehak Sink Couplings facilitate fast water evacuation while trapping food waste particles to prevent plumbing clogs.',
      featured: true,
      available: true,
      specifications: [
        { label: 'Category', value: 'Sink Couplings' },
        { label: 'Brand', value: 'Mehak' },
        { label: 'Manufacturer', value: 'Hari Har Industries' },
      ],
    },
    {
      name: 'Jet Spray',
      slug: 'jet-spray',
      categorySlug: 'jet-sprays',
      material: 'Reinforced Polymer / Brass Nut',
      shortDescription: 'Precision toilet seat jet spray unit for targeted water flow.',
      description: 'Mehak Jet Spray assemblies offer reliable water pressure dispersion for commodes. Built for easy mounting under toilet seats with flexible connecting tubes and drip-free seals.',
      featured: true,
      available: true,
      specifications: [
        { label: 'Category', value: 'Jet Sprays' },
        { label: 'Brand', value: 'Mehak' },
        { label: 'Manufacturer', value: 'Hari Har Industries' },
      ],
    },
    {
      name: 'Waste Pipe',
      slug: 'waste-pipe',
      categorySlug: 'waste-pipes',
      material: 'Flexible Heavy Polymer',
      shortDescription: 'Flexible expandable waste outlet pipe for wash basins and sinks.',
      description: 'Mehak Waste Pipes are manufactured using high-grade flexible polymer compounds that resist cracking, hot water thermal expansion, and kinking during installation.',
      featured: true,
      available: true,
      specifications: [
        { label: 'Category', value: 'Waste Pipes' },
        { label: 'Brand', value: 'Mehak' },
        { label: 'Manufacturer', value: 'Hari Har Industries' },
      ],
    },
    {
      name: 'Bathroom Accessories Set',
      slug: 'bathroom-accessories',
      categorySlug: 'bathroom-accessories',
      material: 'Stainless Steel / Alloy Finish',
      shortDescription: 'Complete bath accessories including towel rod, soap dish, and robe hooks.',
      description: 'Modernize bath spaces with coordinated Mehak hardware accessories crafted for sturdy wall attachment, rust resistance, and daily utility.',
      featured: true,
      available: true,
      specifications: [
        { label: 'Category', value: 'Bathroom Accessories' },
        { label: 'Brand', value: 'Mehak' },
        { label: 'Manufacturer', value: 'Hari Har Industries' },
      ],
    },
    {
      name: 'Brass Extension Nipple',
      slug: 'brass-extension-nipple',
      categorySlug: 'other-sanitary-hardware',
      material: 'High-Purity Brass Alloy',
      shortDescription: 'Precision-threaded brass extension nipple fitting for sanitary pipe extensions.',
      description: 'Heavy brass extension nipples designed for secure thread engagement, leak-proof jointing, and high-pressure plumbing installations.',
      featured: true,
      available: true,
      specifications: [
        { label: 'Category', value: 'Other Sanitary Hardware' },
        { label: 'Brand', value: 'Mehak' },
        { label: 'Manufacturer', value: 'Hari Har Industries' },
      ],
    },
  ];

  for (const prodData of productsData) {
    const categoryId = categoryMap.get(prodData.categorySlug);
    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {
        name: prodData.name,
        shortDescription: prodData.shortDescription,
        description: prodData.description,
        material: prodData.material,
        featured: prodData.featured,
        available: prodData.available,
        specifications: prodData.specifications,
        categoryId,
      },
      create: {
        name: prodData.name,
        slug: prodData.slug,
        shortDescription: prodData.shortDescription,
        description: prodData.description,
        material: prodData.material,
        featured: prodData.featured,
        available: prodData.available,
        specifications: prodData.specifications,
        categoryId,
      },
    });
  }

  console.log('✓ Created initial generic products catalogue in DB');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
