'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { resolveComplaint } from '@/lib/adminActions';

interface ComplaintActionsProps {
  complaintId: string;
  status: string;
}

export function ComplaintActions({ complaintId, status }: ComplaintActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleResolve = async () => {
    setLoading(true);
    await resolveComplaint(complaintId);
    window.location.reload();
  };

  if (status === 'resolved') {
    return (
      <span className="text-[9px] text-on-success-mint font-bold uppercase tracking-widest">
        Resolved
      </span>
    );
  }

  return (
    <Button
      onClick={handleResolve}
      disabled={loading}
      className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest"
    >
      {loading ? 'Resolving...' : 'Resolve'}
    </Button>
  );
}