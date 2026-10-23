'use client';

import { useActionState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { createWalletRequestAction } from '@/lib/actions/wallet';
import type { ActionState } from '@/lib/types';
import { SubmitButton } from './submit-button';
import { StateMessage } from './state-message';

export function WalletRequestForms({ whatsapp, qrisPath, adminWhatsapp }: {
  whatsapp: string;
  qrisPath: string;
  adminWhatsapp: string;
}) {
  const [topupState, topupAction] = useActionState<ActionState, FormData>(createWalletRequestAction, {});
  const [refundState, refundAction] = useActionState<ActionState, FormData>(createWalletRequestAction, {});

  return (
    <div className="detail-grid">
      <section className="neon-panel panel-pad">
        <span className="eyebrow"><ArrowDownToLine size={13} /> TOP-UP MANUAL</span>
        <h2 className="display" style={{ marginTop: 0 }}>Isi Saldo</h2>
        <p className="muted" style={{ fontSize: 11, lineHeight: 1.7 }}>Buat permintaan, bayar QRIS, lalu kirim bukti ke admin. Saldo masuk setelah disetujui.</p>
        <div className="qris-box"><img src={qrisPath} alt="QRIS SYAD MARKET" width={2531} height={2560} /></div>
        <form action={topupAction} className="stack" style={{ marginTop: 15 }}>
          <input type="hidden" name="type" value="TOPUP" />
          <div className="field"><label>Nominal Top-up</label><input name="amount" type="number" min="10000" max="10000000" step="1000" required placeholder="Contoh: 50000" /></div>
          <div className="field"><label>WhatsApp Konfirmasi</label><input name="whatsapp" defaultValue={whatsapp} required inputMode="tel" /></div>
          <div className="field"><label>Catatan (Opsional)</label><textarea name="note" placeholder="Nama pengirim atau catatan pembayaran..." /></div>
          <StateMessage state={topupState} />
          <SubmitButton className="btn btn-primary btn-block">BUAT PERMINTAAN TOP-UP</SubmitButton>
          <a className="btn btn-ghost btn-block" href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent('Halo Admin SYAD, saya ingin konfirmasi top-up saldo.')}`} target="_blank" rel="noopener">KONFIRMASI WHATSAPP</a>
        </form>
      </section>

      <section className="panel panel-pad">
        <span className="eyebrow"><ArrowUpFromLine size={13} /> REFUND SALDO</span>
        <h2 className="display" style={{ marginTop: 0 }}>Tarik Saldo</h2>
        <p className="muted" style={{ fontSize: 11, lineHeight: 1.7 }}>Dana ditahan saat pengajuan. Jika ditolak, dana otomatis kembali ke saldo. Jika disetujui, admin memproses refund manual.</p>
        <form action={refundAction} className="stack" style={{ marginTop: 15 }}>
          <input type="hidden" name="type" value="REFUND" />
          <div className="field"><label>Nominal Refund</label><input name="amount" type="number" min="10000" max="10000000" step="1000" required placeholder="Contoh: 25000" /></div>
          <div className="field"><label>WhatsApp / Tujuan Refund</label><input name="whatsapp" defaultValue={whatsapp} required /></div>
          <div className="field"><label>Detail E-wallet / Rekening</label><textarea name="note" required minLength={5} placeholder="Contoh: DANA 08xx atas nama..." /></div>
          <StateMessage state={refundState} />
          <SubmitButton className="btn btn-secondary btn-block">AJUKAN REFUND</SubmitButton>
        </form>
      </section>
    </div>
  );
}
