import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { ActionState } from '@/lib/types';

export function StateMessage({ state }: { state: ActionState }) {
  if (state.error) return <div className="alert alert-error"><AlertCircle size={17} /><span>{state.error}</span></div>;
  if (state.success) return <div className="alert alert-success"><CheckCircle2 size={17} /><span>{state.success}</span></div>;
  return null;
}

export function ManualNotice() {
  return <div className="alert alert-info"><Info size={17} /><span>Mode manual aktif. Admin memverifikasi pembayaran dan memproses hasil pesanan.</span></div>;
}
