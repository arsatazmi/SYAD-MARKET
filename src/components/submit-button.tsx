'use client';

import { useFormStatus } from 'react-dom';
import { LoaderCircle } from 'lucide-react';

export function SubmitButton({ children, className = 'btn btn-primary', disabled = false }: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={pending || disabled} aria-disabled={pending || disabled}>
      {pending ? <LoaderCircle size={16} className="spin" /> : null}
      {pending ? 'MEMPROSES...' : children}
    </button>
  );
}
