'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { updateBookingStatus } from '@/lib/adminActions';

interface BookingActionsProps {
  bookingId: string;
  currentStatus: string;
}

export function BookingActions({ bookingId, currentStatus }: BookingActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (status: 'checked_in' | 'completed' | 'cancelled') => {
    setLoading(true);
    await updateBookingStatus(bookingId, status);
    window.location.reload();
  };

  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return (
      <span className="text-[9px] text-outline font-medium italic">
        {currentStatus === 'completed' ? 'Completed' : 'Cancelled'}
      </span>
    );
  }

  return (
    <div className="flex gap-1">
      {currentStatus === 'upcoming' && (
        <Button
          onClick={() => handleStatusUpdate('checked_in')}
          disabled={loading}
          className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest"
        >
          Check In
        </Button>
      )}
      {currentStatus === 'checked_in' && (
        <Button
          onClick={() => handleStatusUpdate('completed')}
          disabled={loading}
          className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest"
        >
          Complete
        </Button>
      )}
      <Button
        variant="outline"
        onClick={() => handleStatusUpdate('cancelled')}
        disabled={loading}
        className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border-error/50 text-error hover:bg-error/10"
      >
        Cancel
      </Button>
    </div>
  );
}