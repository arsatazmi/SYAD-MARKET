'use client';

import { useActionState } from 'react';
import { CheckCircle2, WalletCards, XCircle } from 'lucide-react';
import { cancelOrderAction, markQrisPaidAction, payWithBalanceAction } from '@/lib/actions/order';
import { rupiah } from '@/lib/format';
import type { ActionState } from '@/lib/types';
import { SubmitButton } from './submit-button';
import { StateMessage } from './state-message';

export function PaymentActions({ code, total, balance, canPay, canCancel }: {
  code: string;
  total: number;
  balance: number;
  canPay: boolean;
  canCancel: boolean;
}) {
  const [qrisState, qrisAction] = useActionState<ActionState, FormData>(markQrisPaidAction, {});
  const [balanceState, balanceAction] = useActionState<ActionState, FormData>(payWithBalanceAction, {});
  const [cancelState, cancelAction] = useActionState<ActionState, FormData>(cancelOrderAction, {});

  return (
    <div className="stack">
      {canPay ? (
        <>
          <form action={qrisAction} className="stack">
            <input type="hidden" name="code" value={code} />
            <SubmitButton className="btn btn-primary btn-block"><CheckCircle2 size={16} /> SAYA SUDAH BAYAR QRIS</SubmitButton>
            <StateMessage state={qrisState} />
          </form>
          <form action={balanceAction} className="stack">
            <input type="hidden" name="code" value={code} />
            <SubmitButton className="btn btn-secondary btn-block" disabled={balance < total}><WalletCards size={16} /> BAYAR DENGAN SALDO ({rupiah(balance)})</SubmitButton>
            {balance < total ? <small className="muted">Saldo belum cukup untuk order ini.</small> : null}
            <StateMessage state={balanceState} />
          </form>
        </>
      ) : null}
      {canCancel ? (
        <form action={cancelAction} className="stack">
          <input type="hidden" name="code" value={code} />
          <SubmitButton className="btn btn-danger btn-sm"><XCircle size={14} /> Batalkan Order</SubmitButton>
          <StateMessage state={cancelState} />
        </form>
      ) : null}
    </div>
  );
}
