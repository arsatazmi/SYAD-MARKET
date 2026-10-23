import { ShieldCheck, TrendingUp } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getPublicCatalog, getStoreSetting } from '@/lib/data';
import { PublicHeader } from '@/components/public-header';
import { Storefront } from '@/components/storefront';
import { ManualNotice } from '@/components/state-message';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'SMM Panel' };

export default async function SmmPage() {
  const [setting, categories, user] = await Promise.all([getStoreSetting(), getPublicCatalog(), getCurrentUser()]);
  return (
    <>
      <PublicHeader user={user} storeName={setting.storeName} logoPath={setting.logoPath} />
      <main className="public-main"><div className="container">
        <section className="section" style={{ marginTop: 0 }}>
          <div className="section-heading">
            <div><span className="eyebrow"><TrendingUp size={12} /> SOCIAL MEDIA MARKETING</span><h1>SMM Panel SYAD</h1><p>Instagram, TikTok, YouTube, Facebook, Telegram, X, dan WhatsApp Channel.</p></div>
            <span className="badge badge-purple"><ShieldCheck size={12} /> 21 LAYANAN</span>
          </div>
          <ManualNotice />
          <div style={{ height: 16 }} />
          <Storefront categories={categories} user={user} onlySmm />
        </section>
      </div></main>
    </>
  );
}
