'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, QrCode, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { checkIn } from './actions';

export default function CheckinPage() {
  const [checkinCode, setCheckinCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('checking');

    const result = await checkIn(checkinCode.toUpperCase());

    if (result.success) {
      setBooking(result.booking);
      setStatus('success');
    } else {
      setError(result.error || 'Invalid check-in code');
      setStatus('error');
    }
  };

  if (status === 'success' && booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
        <Card className="max-w-md w-full text-center py-12 border-none shadow-2xl">
          <div className="bg-success-mint w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-on-success-mint w-10 h-10" />
          </div>
          <h1 className="font-manrope text-3xl font-bold mb-2 text-primary">Checked In!</h1>
          <p className="text-on-surface-variant mb-2 font-medium">
            You are checked in for:
          </p>
          <p className="font-manrope font-bold text-xl text-primary mb-1">
            {booking.service?.name}
          </p>
          <p className="text-sm text-on-surface-variant mb-6">
            {booking.branch?.name}
          </p>
          <div className="bg-surface-container-lowest p-4 rounded-xl mb-6">
            <p className="text-[10px] uppercase font-bold text-outline tracking-widest mb-2">
              Please Wait
            </p>
            <p className="text-sm text-on-surface-variant">
              Your appointment will be called shortly. Keep an eye on the display screen.
            </p>
          </div>
          <Link href="/dashboard">
            <Button className="w-full">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center text-on-background font-inter">
      <div className="max-w-md w-full">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-surface-container rounded-xl transition-all border border-transparent hover:border-outline-variant/30">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Link>
          <h1 className="font-manrope text-2xl font-bold text-primary tracking-tight">Check In</h1>
        </header>

        <Card className="border-outline-variant/30 shadow-xl overflow-hidden">
          <div className="bg-surface-tint/10 p-6 flex items-center gap-4 border-b border-outline-variant/30">
            <div className="bg-surface-tint p-3 rounded-xl">
              <QrCode className="text-on-surface-tint w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-outline font-black uppercase tracking-widest">Appointment</p>
              <p className="text-lg font-manrope font-bold text-on-surface">Check In</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">
                Check-In Code
              </p>
              <p className="text-sm text-on-surface-variant">
                Enter the check-in code from your booking confirmation to mark your arrival.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">
                Check-In Code
              </label>
              <input
                type="text"
                required
                value={checkinCode}
                onChange={(e) => setCheckinCode(e.target.value.toUpperCase())}
                className="w-full px-6 h-16 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-2xl font-mono font-bold text-center tracking-widest uppercase bg-surface-container-lowest"
                placeholder="BL-XXXXXXXX"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-error bg-error/10 p-3 rounded-xl">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold text-sm">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-lg shadow-lg shadow-primary/20"
              disabled={status === 'checking'}
            >
              {status === 'checking' ? 'Checking In...' : 'Check In'}
            </Button>
          </form>

          <div className="px-6 pb-6">
            <p className="text-[9px] text-center font-bold text-on-surface-variant uppercase tracking-widest opacity-70">
              You can check in up to 15 minutes before your appointment time.
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/booking" className="text-sm font-bold text-primary hover:underline">
            Book a new appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
