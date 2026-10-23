'use client';

import { useActionState } from 'react';
import { MessageSquareText, ShieldCheck } from 'lucide-react';
import { createReviewAction, createWarrantyClaimAction } from '@/lib/actions/support';
import type { ActionState } from '@/lib/types';
import { SubmitButton } from './submit-button';
import { StateMessage } from './state-message';

export function ReviewForm({ orderId }: { orderId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(createReviewAction, {});
  return (
    <form action={action} className="stack">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="field"><label>Rating</label><select name="rating" defaultValue="5" required>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></div>
      <div className="field"><label>Ulasan Pembeli</label><textarea name="comment" required minLength={5} placeholder="Bagaimana pengalaman order kamu?" /></div>
      <StateMessage state={state} />
      <SubmitButton className="btn btn-primary"><MessageSquareText size={15} /> KIRIM ULASAN</SubmitButton>
    </form>
  );
}

export function WarrantyForm({ orderId }: { orderId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(createWarrantyClaimAction, {});
  return (
    <form action={action} className="stack">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="field"><label>Jelaskan Masalah</label><textarea name="description" required minLength={10} placeholder="Tulis kendala, detail error, dan waktu kejadian..." /></div>
      <StateMessage state={state} />
      <SubmitButton className="btn btn-secondary"><ShieldCheck size={15} /> AJUKAN GARANSI</SubmitButton>
    </form>
  );
}
