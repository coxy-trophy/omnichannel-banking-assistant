'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, XCircle, QrCode, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cancelBooking, getBookingById } from '../actions';

interface Booking {
  id: string;
  service: { name: string } | null;
  branch: { name: string; location: string | null } | null;
  timeslot: Date | string;
  status: string;
  checkinCode: string;
  createdAt: Date | string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      const data = await getBookingById(bookingId);
      if (data) {
        setBooking({
          id: data.id,
          service: data.service,
          branch: data.branch,
          timeslot: data.timeslot,
          status: data.status,
          checkinCode: data.checkinCode,
          createdAt: data.createdAt,
        });
      }
      setLoading(false);
    }
    loadBooking();
  }, [bookingId]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setCancelling(true);
    const result = await cancelBooking(bookingId);

    if (result.success) {
      setBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
    }
    setCancelling(false);
  };

  const handleCopyCode = () => {
    if (booking?.checkinCode) {
      navigator.clipboard.writeText(booking.checkinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Placeholder for when booking data would be fetched
  if (!booking) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center text-on-background font-inter">
        <div className="max-w-2xl w-full">
          <header className="mb-8 flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-surface-container rounded-xl transition-all border border-transparent hover:border-outline-variant/30">
              <ArrowLeft className="w-6 h-6 text-primary" />
            </Link>
            <h1 className="font-manrope text-2xl font-bold text-primary tracking-tight">Booking Details</h1>
          </header>

          <Card className="p-12 text-center border-dashed border-2 border-outline-variant/50">
            <Calendar className="w-12 h-12 text-outline mx-auto mb-4" />
            <p className="text-on-surface-variant font-medium mb-4">
              Booking detail view - integrate with your data source
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    upcoming: { label: 'Upcoming', className: 'bg-primary/10 text-primary border-primary/20' },
    checked_in: { label: 'Checked In', className: 'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant' },
    completed: { label: 'Completed', className: 'bg-success-mint text-on-success-mint' },
    cancelled: { label: 'Cancelled', className: 'bg-error/10 text-error' },
  };

  const status = statusConfig[booking.status] || statusConfig.upcoming;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center text-on-background font-inter">
      <div className="max-w-2xl w-full">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-surface-container rounded-xl transition-all border border-transparent hover:border-outline-variant/30">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Link>
          <div className="flex-1">
            <h1 className="font-manrope text-2xl font-bold text-primary tracking-tight">Booking Details</h1>
            <p className="text-xs text-on-surface-variant font-medium">Appointment #{booking.id.slice(0, 8)}</p>
          </div>
        </header>

        {/* Status Card */}
        <Card className="p-6 border-outline-variant/30 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-manrope font-bold text-lg">{booking.service?.name || 'Service'}</h2>
            <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${status.className}`}>
              {status.label}
            </span>
          </div>

          {/* Check-in Code */}
          <div className="bg-surface-container-highest/50 p-4 rounded-xl border border-outline-variant mb-6">
            <p className="text-[10px] uppercase font-bold text-outline tracking-widest mb-2 text-center">Check-in Code</p>
            <div className="flex items-center justify-center gap-3">
              <QrCode className="w-12 h-12 text-primary" />
              <div className="text-center">
                <p className="font-mono text-2xl font-bold tracking-tighter text-primary">{booking.checkinCode}</p>
                <button
                  onClick={handleCopyCode}
                  className="text-[10px] font-bold text-primary flex items-center gap-1 mt-1 hover:underline"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-outline tracking-widest">Date & Time</p>
                <p className="font-manrope font-bold text-primary">
                  {new Date(booking.timeslot).toLocaleString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-outline tracking-widest">Branch</p>
                <p className="font-bold">{booking.branch?.name || 'Branch'}</p>
                {booking.branch?.location && (
                  <p className="text-xs text-on-surface-variant">{booking.branch.location}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        {booking.status === 'upcoming' && (
          <div className="space-y-3">
            <Link href="/checkin" className="block">
              <Button className="w-full gap-2" variant="secondary">
                <QrCode className="w-4 h-4" />
                Check In Now
              </Button>
            </Link>
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              variant="outline"
              className="w-full gap-2 border-error/50 text-error hover:bg-error/10"
            >
              <XCircle className="w-4 h-4" />
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </div>
        )}

        {booking.status === 'checked_in' && (
          <Card className="p-6 text-center bg-success-mint/10 border-success-mint/20">
            <CheckCircle2 className="w-12 h-12 text-on-success-mint mx-auto mb-2" />
            <p className="font-bold text-on-success-mint">You are checked in!</p>
            <p className="text-xs text-on-surface-variant">
              Please wait for your appointment to be called.
            </p>
          </Card>
        )}

        {(booking.status === 'completed' || booking.status === 'cancelled') && (
          <Link href="/booking">
            <Button className="w-full">Book Another Appointment</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
