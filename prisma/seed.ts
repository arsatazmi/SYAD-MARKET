import { FulfillmentMode, PrismaClient, ProductKind, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const rupiah = (value: number) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;

type ProductSeed = {
  category: string;
  name: string;
  slug: string;
  description: string;
  priceLabel: string;
  price?: number;
  kind?: ProductKind;
  unit?: string;
  minQuantity?: number;
  maxQuantity?: number;
  requiresQuote?: boolean;
  featured?: boolean;
  instructions?: string;
  estimate?: string;
  guarantee?: string;
};

const categories = [
  ['apk', 'ALL SELL APK', 'Daftar APK SYAD MARKET dengan harga asli.', 'package', 1],
  ['smm', 'SMM PANEL', 'Layanan social media marketing yang diproses manual.', 'trending-up', 2],
  ['premium', 'PREMIUM', 'Paket dan aplikasi premium pilihan.', 'crown', 3],
  ['panel', 'PANEL', 'Panel private, public, dan kebutuhan server bot.', 'server', 4],
  ['script', 'SCRIPT & BOT', 'Script, Bot JPM/MD, dan kebutuhan otomatisasi.', 'bot', 5],
  ['vps', 'VPS', 'Order VPS sesuai kebutuhan dan spesifikasi.', 'cloud', 6],
  ['otp', 'NOKOS / OTP', 'Nomor virtual dan layanan OTP manual.', 'message-square', 7],
  ['website', 'WEBSITE', 'Jasa pembuatan dan perbaikan website.', 'code-2', 8],
  ['digital', 'LAYANAN DIGITAL', 'Domain, akun D.O, Jasbug, Jasban, dan lainnya.', 'sparkles', 9],
] as const;

const products: ProductSeed[] = [
  // List dan harga asli SYAD MARKET — tidak dihapus atau disesuaikan diam-diam.
  { category: 'apk', name: '𝘼𝙋𝙆 𝙃𝙊𝙇𝙇𝙊𝙒', slug: 'apk-hollow', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '3-80𝙆', requiresQuote: true },
  { category: 'apk', name: '𝘼𝙋𝙆 𝙈𝘼𝙉𝙏𝘼 𝙭 𝙍𝘼𝙏', slug: 'apk-manta-rat', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '5-100𝙆', requiresQuote: true },
  { category: 'apk', name: '𝘼𝙋𝙆 𝙉𝙀𝙑𝙀𝙓', slug: 'apk-nevex', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '1-80𝙆', requiresQuote: true },
  { category: 'apk', name: '𝘼𝙋𝙆 𝙏𝙍𝘼𝙋𝙀𝙉𝘿𝙀𝙉', slug: 'apk-trapenden', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '20-75𝙠', requiresQuote: true },
  { category: 'apk', name: '𝘼𝙋𝙆 𝙑𝙊𝙇𝙏𝘼𝙍𝘼', slug: 'apk-voltara', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '5-50𝙆', requiresQuote: true },
  { category: 'apk', name: '𝙈𝙐𝙍𝘽𝘼𝙉𝘿 𝙒𝙃𝘼𝙏𝙎𝘼𝙋𝙋', slug: 'murband-whatsapp', description: 'Produk SYAD MARKET • Perlu link saluran informasi.', priceLabel: '50𝙆', price: 50000, requiresQuote: false, instructions: 'Siapkan link saluran WhatsApp untuk dicantumkan pada catatan order.' },
  { category: 'apk', name: '𝙈𝙐𝙍𝙍𝘼𝙉𝙎𝙊𝙈', slug: 'murransom', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '25𝙆', price: 25000, requiresQuote: false },
  { category: 'apk', name: '𝙅𝘼𝙎𝙇𝙊𝙂', slug: 'jaslog', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '5-10𝙆', requiresQuote: true },
  { category: 'apk', name: '𝙈𝙐𝙍𝙇𝙊𝙂', slug: 'murlog', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '25𝙆', price: 25000, requiresQuote: false },
  { category: 'apk', name: '𝘼𝙋𝙆 𝘽𝘼𝙉𝙉𝙀𝘿', slug: 'apk-banned', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '25𝙆', price: 25000, requiresQuote: false },
  { category: 'apk', name: '𝘼𝙋𝙆 𝘼𝙐𝙏𝙊 𝙎𝘼𝙑𝙀 𝙆𝙊𝙉𝙏𝘼𝙆', slug: 'apk-auto-save-kontak', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '10𝙆', price: 10000, requiresQuote: false },
  { category: 'apk', name: '𝘼𝙋𝙆 𝙍𝙀𝙎𝙋𝙊𝙉 𝙊𝙏𝙊𝙈𝘼𝙏𝙄𝙎', slug: 'apk-respon-otomatis', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '15𝙆', price: 15000, requiresQuote: false },
  { category: 'apk', name: '𝘼𝙋𝙆 𝙀 𝙆𝙏𝙋', slug: 'apk-e-ktp', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '30𝙆', price: 30000, requiresQuote: false },
  { category: 'apk', name: '𝘼𝙋𝙆 𝙂𝘼𝙈𝙀 𝙋𝙎', slug: 'apk-game-ps', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '5𝙆', price: 5000, requiresQuote: false },
  { category: 'apk', name: '𝘼𝙋𝙆 𝙂𝘼𝙈𝙀 𝙋𝘾', slug: 'apk-game-pc', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '15𝙆', price: 15000, requiresQuote: false },
  { category: 'apk', name: '𝘼𝙋𝙆 𝙆𝙀𝙉𝙊𝙉', slug: 'apk-kenon', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '50𝙆', price: 50000, requiresQuote: false },
  { category: 'apk', name: '𝘼𝙋𝙆 𝙉𝙊𝙆𝙊𝙎', slug: 'apk-nokos', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '25𝙆', price: 25000, requiresQuote: false },
  { category: 'apk', name: '𝘼𝙋𝙆 𝘾𝙀𝙆 𝘽𝘼𝙉𝘿', slug: 'apk-cek-band', description: 'Produk SYAD MARKET • Harga sesuai paket.', priceLabel: '10𝙆', price: 10000, requiresQuote: false },

  { category: 'premium', name: 'PREMIUM DIGITAL', slug: 'premium-digital', description: 'Konfirmasi paket dan harga terbaru langsung ke admin.', priceLabel: 'CHAT ADMIN', requiresQuote: true, featured: true },
  { category: 'premium', name: 'PREMIUM APK', slug: 'premium-apk', description: 'Pilihan produk premium sesuai stok yang tersedia.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'premium', name: 'PREMIUM SERVICE', slug: 'premium-service', description: 'Hubungi admin untuk detail layanan.', priceLabel: 'CHAT ADMIN', requiresQuote: true },

  { category: 'panel', name: 'PANEL PRIVATE', slug: 'panel-private', description: 'Panel private dengan detail paket dari admin.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'panel', name: 'PANEL PUBLIC', slug: 'panel-public', description: 'Panel public sesuai stok dan spesifikasi.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'panel', name: 'PANEL LEGAL', slug: 'panel-legal', description: 'Sebutkan RAM dan durasi pada detail paket.', priceLabel: 'CHAT ADMIN', requiresQuote: true },

  { category: 'script', name: 'BOT JPM / MD', slug: 'bot-jpm-md', description: 'Konsultasikan kebutuhan bot kepada admin.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'script', name: 'SCRIPT BOT WHATSAPP', slug: 'script-bot-whatsapp', description: 'Script bot WhatsApp dengan fulfilment manual.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'script', name: 'SCRIPT WEB STORE', slug: 'script-web-store', description: 'Script toko digital sesuai kebutuhan.', priceLabel: 'CHAT ADMIN', requiresQuote: true },

  { category: 'vps', name: 'ORDER VPS', slug: 'order-vps', description: 'Tulis provider, spesifikasi, region, dan OS pada detail paket.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'otp', name: 'NOKOS / OTP', slug: 'nokos-otp', description: 'Tulis negara, layanan, dan operator pada detail paket.', priceLabel: 'CHAT ADMIN', requiresQuote: true },

  { category: 'website', name: 'JASA BUAT WEB', slug: 'jasa-buat-web', description: 'Website custom sesuai kebutuhan.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'website', name: 'WEB STORE', slug: 'web-store', description: 'Landing page toko dengan katalog dan tombol order.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'website', name: 'LANDING PAGE', slug: 'landing-page', description: 'Halaman promosi modern dan responsive.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'website', name: 'EDIT / FIX WEB', slug: 'edit-fix-web', description: 'Perbaikan tampilan dan fitur website.', priceLabel: 'CHAT ADMIN', requiresQuote: true },

  { category: 'digital', name: 'DOMAIN WEB', slug: 'domain-web', description: 'Tulis nama domain yang diinginkan pada detail paket.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'digital', name: 'AKUN D.O', slug: 'akun-do', description: 'Detail paket dan stok dikonfirmasi admin.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'digital', name: 'JASBUG', slug: 'jasbug', description: 'Konsultasikan kebutuhan pada detail order.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
  { category: 'digital', name: 'JASBAN', slug: 'jasban', description: 'Konsultasikan kebutuhan pada detail order.', priceLabel: 'CHAT ADMIN', requiresQuote: true },
];

const smmServices = [
  ['Instagram', 'Followers', 45000, 100, 50000],
  ['Instagram', 'Likes', 5000, 100, 100000],
  ['Instagram', 'Views', 2500, 500, 1000000],
  ['Instagram', 'Comments', 60000, 10, 5000],
  ['TikTok', 'Followers', 35000, 100, 100000],
  ['TikTok', 'Likes', 4000, 100, 100000],
  ['TikTok', 'Views', 1500, 500, 1000000],
  ['TikTok', 'Shares', 8000, 100, 100000],
  ['YouTube', 'Subscribers', 60000, 50, 50000],
  ['YouTube', 'Views', 8000, 500, 1000000],
  ['YouTube', 'Likes', 12000, 100, 100000],
  ['YouTube', 'Watch Hours', 350000, 10, 4000],
  ['Facebook', 'Followers', 35000, 100, 100000],
  ['Facebook', 'Likes', 8000, 100, 100000],
  ['Facebook', 'Views', 3000, 500, 1000000],
  ['Telegram', 'Channel Members', 30000, 100, 100000],
  ['Telegram', 'Post Views', 2000, 500, 1000000],
  ['X/Twitter', 'Followers', 55000, 100, 50000],
  ['X/Twitter', 'Likes', 12000, 100, 100000],
  ['X/Twitter', 'Views', 3000, 500, 1000000],
  ['WhatsApp Channel', 'Followers', 40000, 100, 100000],
] as const;

for (const [platform, service, price, minQuantity, maxQuantity] of smmServices) {
  const slug = `smm-${platform}-${service}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
  products.push({
    category: 'smm',
    name: `${platform} ${service}`.toUpperCase(),
    slug,
    description: `${service} ${platform} • Diproses manual oleh admin setelah pembayaran diverifikasi.`,
    priceLabel: `${rupiah(price)} / 1.000`,
    price,
    kind: ProductKind.SMM,
    unit: '1000',
    minQuantity,
    maxQuantity,
    requiresQuote: false,
    instructions: 'Gunakan link atau username target publik. Jangan pernah memberikan password akun.',
    estimate: 'Estimasi 1–24 jam setelah pembayaran diverifikasi.',
    guarantee: 'Konfirmasi ketersediaan garansi/refill ke admin sebelum order.',
  });
}

async function main() {
  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: 'SYAD MARKET',
      tagline: 'Market digital terpercaya • verifikasi manual oleh admin',
      whatsapp: '6283177610152',
      qrisPath: '/assets/qris.jpg',
      logoPath: '/assets/logo.jpg',
      announcement: 'Semua pembayaran dan pesanan diproses manual. Konfirmasi QRIS melalui WhatsApp admin.',
    },
  });

  await prisma.banner.upsert({
    where: { id: 'default-syad-banner' },
    update: {},
    create: {
      id: 'default-syad-banner',
      title: 'SYAD MARKET',
      subtitle: 'Aman & terpercaya • harga terjangkau • layanan 24/7',
      imagePath: '/assets/banner.webp',
      sortOrder: 1,
    },
  });

  if ((await prisma.announcement.count()) === 0) {
    await prisma.announcement.create({
      data: {
        title: 'Sistem manual aktif',
        message: 'Pembayaran, top-up saldo, SMM, panel, VPS, OTP, dan pengiriman hasil pesanan diverifikasi serta diproses langsung oleh admin.',
      },
    });
  }

  await prisma.provider.upsert({
    where: { name: 'MANUAL' },
    update: {},
    create: { name: 'MANUAL', enabled: false },
  });

  for (const [slug, name, description, icon, sortOrder] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { slug, name, description, icon, sortOrder },
    });
  }

  const categoryRecords = await prisma.category.findMany();
  const categoryMap = new Map(categoryRecords.map((category) => [category.slug, category.id]));

  for (const product of products) {
    const { category, ...data } = product;
    const categoryId = categoryMap.get(category);
    if (!categoryId) throw new Error(`Category not found: ${category}`);

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...data,
        categoryId,
        price: product.price ?? 0,
        kind: product.kind ?? ProductKind.STANDARD,
        unit: product.unit ?? 'order',
        minQuantity: product.minQuantity ?? 1,
        maxQuantity: product.maxQuantity ?? 1,
        requiresQuote: product.requiresQuote ?? true,
        fulfillmentMode: FulfillmentMode.MANUAL,
      },
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const adminPassword = process.env.ADMIN_PASSWORD || (!isProduction ? 'SyadAdmin2026!' : null);
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';

  if (adminPassword) {
    const existingAdmin = await prisma.user.findUnique({ where: { username: adminUsername } });
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          username: adminUsername,
          email: process.env.ADMIN_EMAIL || null,
          name: 'Administrator SYAD',
          passwordHash: await bcrypt.hash(adminPassword, 12),
          role: Role.ADMIN,
          active: true,
        },
      });
      console.log(`Created admin account: ${adminUsername}`);
    } else if (existingAdmin.role !== Role.ADMIN) {
      await prisma.user.update({ where: { id: existingAdmin.id }, data: { role: Role.ADMIN } });
    }
  } else {
    console.warn('Admin seed skipped: set ADMIN_PASSWORD to create the initial production admin.');
  }

  if (!isProduction) {
    const member = await prisma.user.findUnique({ where: { username: 'member' } });
    if (!member) {
      await prisma.user.create({
        data: {
          username: 'member',
          email: 'member@syad.local',
          name: 'Member Demo',
          whatsapp: '081234567890',
          passwordHash: await bcrypt.hash('MemberDemo2026!', 12),
          balance: 250000,
          role: Role.MEMBER,
        },
      });
    }
  }

  console.log(`Seed complete: ${categories.length} categories, ${products.length} products (${smmServices.length} SMM services).`);
  if (!isProduction) {
    console.log('Local demo accounts: admin / SyadAdmin2026! and member / MemberDemo2026!');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
