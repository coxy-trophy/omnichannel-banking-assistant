'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { verifyKyc, rejectKyc } from '@/lib/adminActions';

interface KycActionsProps {
  userId: string;
}

export function KycActions({ userId }: KycActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    await verifyKyc(userId);
    window.location.reload();
  };

  const handleReject = async () => {
    setLoading(true);
    await rejectKyc(userId);
    window.location.reload();
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleVerify}
        disabled={loading}
        className="px-4 py-2 text-[10px] uppercase font-bold tracking-wider"
      >
        Approve
      </Button>
      <Button
        variant="outline"
        onClick={handleReject}
        disabled={loading}
        className="px-4 py-2 text-[10px] uppercase font-bold tracking-wider border-error/50 text-error hover:bg-error/10"
      >
        Reject
      </Button>
    </div>
  );
}