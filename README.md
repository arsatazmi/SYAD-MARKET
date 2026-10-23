# SYAD MARKET

Marketplace digital full-stack dengan identitas hitam–merah SYAD, katalog asli, SMM Panel, akun member, wallet manual, dan dashboard admin. Seluruh pembayaran dan fulfilment tetap **manual**; tidak ada payment gateway, deteksi pembayaran otomatis, atau pengiriman provider otomatis.

## Fitur

- Storefront responsif dengan aset, list, label harga, QRIS, dan WhatsApp SYAD yang dipertahankan.
- Registrasi/login, profil, ganti password, sesi httpOnly, serta role `MEMBER` dan `ADMIN` yang diperiksa di server.
- Dashboard member, riwayat dan filter order, rekap belanja, notifikasi, hasil pembelian, ulasan, dan klaim garansi.
- Order harga tetap, order SMM berdasarkan jumlah, dan order `CHAT ADMIN`/rentang harga melalui quote admin.
- Pembayaran QRIS + konfirmasi WhatsApp; status lunas hanya melalui verifikasi admin.
- Wallet dengan top-up manual, ledger, penyesuaian saldo oleh admin, serta refund hold dan refund manual.
- Admin untuk order, produk/kategori, harga, stok, member/role, wallet, banner/pengumuman, ulasan, garansi, dan catatan provider.
- SMM Panel awal untuk Instagram, TikTok, YouTube, Facebook, Telegram, X/Twitter, dan WhatsApp Channel.
- Rate, min/max quantity, estimasi, garansi/refill, instruksi, stok, status aktif, provider name, dan provider service ID dapat diatur per produk.
- Transaksi atomik untuk mencegah double debit, double top-up, double refund, dan pengurangan stok berulang.

> Rate dan batas SMM pada seed adalah data awal yang dapat diedit. Tinjau harga, estimasi, dan garansi/refill sebelum digunakan untuk produksi.

## Stack

- Next.js 15 / React 19 / TypeScript
- PostgreSQL / Prisma ORM
- `bcryptjs` untuk password dan `jose` untuk sesi
- Lucide icons dan font lokal Orbitron/Poppins

## Menjalankan secara lokal

Persyaratan: Node.js 20+ dan PostgreSQL.

1. Install dependency:

   ```bash
   npm install
   ```

2. Salin environment lalu isi koneksi database dan secret:

   ```bash
   cp .env.example .env
   ```

3. Terapkan migrasi dan seed:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

4. Jalankan mode development atau build produksi:

   ```bash
   npm run dev
   # atau
   npm run typecheck
   npm run build
   npm run start
   ```

Aplikasi menggunakan `0.0.0.0:3000`.

Akun **khusus demo lokal** yang dibuat saat `NODE_ENV` bukan production:

- Admin: `admin` / `SyadAdmin2026!`
- Member: `member` / `MemberDemo2026!`

Jangan gunakan kredensial demo ini untuk deployment publik.

## Environment

| Variable | Fungsi |
| --- | --- |
| `DATABASE_URL` | Koneksi PostgreSQL runtime. Pooler Supabase dapat digunakan. |
| `DIRECT_URL` | Koneksi langsung PostgreSQL untuk migrasi Prisma. Lokal dapat sama dengan `DATABASE_URL`. |
| `AUTH_SECRET` | Secret sesi minimal 32 karakter. Buat dengan `openssl rand -base64 32`. |
| `ADMIN_USERNAME` | Username admin awal saat seed. |
| `ADMIN_PASSWORD` | Password admin awal saat seed. Tidak menimpa password akun yang sudah ada. |
| `ADMIN_EMAIL` | Email opsional admin awal. |
| `NEXT_PUBLIC_APP_URL` | Origin aplikasi untuk konfigurasi deployment/pengembangan berikutnya. |

File `.env` tidak dimasukkan ke Git. Jangan pernah memasukkan password database, `AUTH_SECRET`, API key provider, atau kredensial produksi ke repository.

## Deploy ke Vercel + Supabase/PostgreSQL

1. Buat database PostgreSQL atau project Supabase.
2. Siapkan `DATABASE_URL` untuk runtime dan `DIRECT_URL` untuk koneksi migrasi langsung. Jika memakai pooler Supabase, gunakan URL pooler untuk runtime dan URL direct/database connection untuk `DIRECT_URL` sesuai dashboard Supabase.
3. Import repository ke Vercel dan tambahkan seluruh environment variable untuk environment **Production**. Gunakan `AUTH_SECRET` dan `ADMIN_PASSWORD` baru yang kuat.
4. `vercel.json` menjalankan:

   ```bash
   prisma migrate deploy && prisma db seed && next build
   ```

   Migrasi diterapkan ke database tujuan, kemudian katalog awal diisi. Seed memakai `update: {}` sehingga menjalankan deploy ulang tidak mereset perubahan katalog/pengaturan admin.
5. Setelah deploy berhasil, login sebagai admin, segera ganti password melalui halaman akun, periksa WhatsApp/QRIS, lalu tinjau seluruh harga dan status layanan.

Database lokal tidak ikut ter-upload. Preview/production harus memakai database dan environment milik deployment tersebut.

## Alur operasional manual

1. Member memilih layanan dan membuat order.
2. Produk `requiresQuote` berstatus `PENDING_QUOTE`; admin menetapkan total sebelum pembayaran.
3. Member memilih QRIS atau saldo:
   - QRIS: member menekan konfirmasi dan mengirim bukti ke WhatsApp. Ini hanya membuat `PENDING_REVIEW`, bukan tanda lunas otomatis.
   - Saldo: debit dan ledger dibuat dalam satu transaksi atomik.
4. Admin memverifikasi pembayaran QRIS, memproses layanan, lalu memasukkan hasil/catatan secara manual.
5. Top-up hanya menambah saldo setelah admin menyetujui. Pengajuan refund menahan saldo; penolakan mengembalikan hold, sedangkan persetujuan menandai proses refund manual oleh admin.
6. Stok terbatas dikurangi pada penyelesaian pertama. Submit selesai berulang tidak mengurangi stok lagi.

## Persiapan API provider

- Produk menyimpan `providerName`, `providerServiceId`, dan `fulfillmentMode` (`MANUAL`/`API`).
- Provider menyimpan base URL dan **nama** environment variable API key, bukan secret-nya.
- UI sengaja mempertahankan mode `MANUAL`. Mode API baru boleh diaktifkan setelah adapter provider, verifikasi webhook, timeout, idempotensi, dan rekonsiliasi status diimplementasikan serta diuji.
- Simpan API key masa depan sebagai environment variable Vercel; jangan menyimpannya di form admin atau database.

## Struktur penting

- `prisma/schema.prisma` — model database dan enum.
- `prisma/migrations/` — migrasi PostgreSQL.
- `prisma/seed.ts` — katalog asli + 21 layanan SMM awal.
- `src/lib/actions/` — server actions untuk transaksi dan administrasi.
- `src/components/storefront.tsx` — katalog dan order builder.
- `src/app/(member)/` — halaman member.
- `src/app/admin/` — halaman admin.
- `public/assets/` — logo, banner, QRIS, dan font lokal.
