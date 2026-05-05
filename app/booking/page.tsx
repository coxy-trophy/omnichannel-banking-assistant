'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, MapPin, Calendar, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getServices, getBranches, createBooking } from './actions';

const STEPS = ['Service', 'Branch', 'Time', 'Confirm'];

// Available time slots (these could be fetched from a schedule table)
const TIME_SLOTS = [
  { label: '08:30 AM', value: 8.5 },
  { label: '11:00 AM', value: 11 },
  { label: '01:45 PM', value: 13.75 },
  { label: '03:30 PM', value: 15.5 },
];

interface Service {
  id: string;
  name: string;
  description: string | null;
  estimatedTime: number;
}

interface Branch {
  id: string;
  name: string;
  location: string | null;
}

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    serviceName: '',
    branchId: '',
    branchName: '',
    time: '',
    confirmed: false,
    checkinCode: '',
  });

  useEffect(() => {
    async function fetchData() {
      const [servicesData, branchesData] = await Promise.all([
        getServices(),
        getBranches(),
      ]);
      setServices(servicesData as Service[]);
      setBranches(branchesData as Branch[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleConfirm = async () => {
    setSubmitting(true);

    // Calculate timeslot date (next available slot today or tomorrow)
    const now = new Date();
    const timeValue = TIME_SLOTS.find(t => t.label === bookingData.time)?.value || 8.5;
    const timeslot = new Date(now);
    timeslot.setHours(Math.floor(timeValue), (timeValue % 1) * 60, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (timeslot <= now) {
      timeslot.setDate(timeslot.getDate() + 1);
    }

    const result = await createBooking({
      serviceId: bookingData.serviceId,
      branchId: bookingData.branchId,
      timeslot,
    });

    if (result.success) {
      setBookingData({ ...bookingData, confirmed: true, checkinCode: result.checkinCode || '' });
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading booking options...</p>
        </div>
      </div>
    );
  }

  if (bookingData.confirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-background">
        <Card className="max-w-md w-full text-center py-12 border-none shadow-2xl">
          <div className="bg-success-mint w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-on-success-mint w-10 h-10" />
          </div>
          <h1 className="font-manrope text-3xl font-bold mb-2 text-primary">Booking Confirmed!</h1>
          <p className="text-on-surface-variant mb-8 font-medium">
            Your institutional check-in code is <span className="font-mono font-bold text-primary text-xl tracking-tighter">{bookingData.checkinCode}</span>
          </p>
          <Link href="/dashboard">
            <Button className="w-full h-14">Return to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center text-on-background">
      <div className="max-w-2xl w-full">
        <header className="mb-12 text-center">
          <h1 className="font-manrope text-4xl font-bold mb-4 text-primary">Schedule a Visit</h1>
          <div className="flex items-center justify-center space-x-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex flex-col items-center ${i <= step ? 'text-primary' : 'text-outline-variant'}`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mb-1 text-xs font-black transition-colors ${i <= step ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant'}`}>
                    {i + 1}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`h-0.5 w-6 mb-4 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-outline-variant'}`} />}
              </React.Fragment>
            ))}
          </div>
        </header>

        <Card className="min-h-[450px] flex flex-col shadow-lg border-outline-variant/30">
          <div className="flex-1">
            {step === 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-bold mb-6">What service do you require?</h2>
                {services.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setBookingData({...bookingData, serviceId: s.id, serviceName: s.name}); nextStep(); }}
                    className="w-full text-left p-5 rounded-2xl border border-outline-variant/50 hover:border-primary hover:bg-primary/5 transition-all flex justify-between items-center group shadow-sm bg-surface-container-lowest"
                  >
                    <div>
                      <span className="font-bold text-on-surface group-hover:text-primary">{s.name}</span>
                      {s.description && <p className="text-xs text-on-surface-variant mt-1">{s.description}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-on-surface-variant">{s.estimatedTime} min</span>
                      <ChevronRight className="w-5 h-5 text-outline-variant group-hover:text-primary transition-transform group-hover:translate-x-1 ml-2" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Select Branch
                </h2>
                {branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setBookingData({...bookingData, branchId: b.id, branchName: b.name}); nextStep(); }}
                    className="w-full text-left p-5 rounded-2xl border border-outline-variant/50 hover:border-primary hover:bg-primary/5 transition-all flex justify-between items-center group shadow-sm bg-surface-container-lowest"
                  >
                    <div>
                      <span className="font-bold text-on-surface group-hover:text-primary">{b.name}</span>
                      {b.location && <p className="text-xs text-on-surface-variant mt-1">{b.location}</p>}
                    </div>
                    <ChevronRight className="w-5 h-5 text-outline-variant group-hover:text-primary" />
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Available Slots
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t.label}
                      onClick={() => { setBookingData({...bookingData, time: t.label}); nextStep(); }}
                      className="p-5 rounded-2xl border border-outline-variant/50 hover:border-primary hover:bg-primary/5 transition-all text-center font-bold shadow-sm bg-surface-container-lowest"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-xl font-bold">Review Application</h2>
                <div className="bg-surface-container-low rounded-2xl p-6 space-y-4 border border-outline-variant/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-bold text-on-surface-variant tracking-widest">Service</span>
                    <span className="font-bold text-primary">{bookingData.serviceName}</span>
                  </div>
                  <div className="h-px bg-outline-variant/30 w-full" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-bold text-on-surface-variant tracking-widest">Branch</span>
                    <span className="font-bold text-primary">{bookingData.branchName}</span>
                  </div>
                  <div className="h-px bg-outline-variant/30 w-full" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-bold text-on-surface-variant tracking-widest">Timeslot</span>
                    <span className="font-bold text-primary">{bookingData.time}</span>
                  </div>
                </div>
                <Button
                  className="w-full h-14 text-lg shadow-lg shadow-primary/20"
                  onClick={handleConfirm}
                  disabled={submitting}
                >
                  {submitting ? 'Confirming...' : 'Confirm Appointment'}
                </Button>
              </div>
            )}
          </div>

          {step > 0 && step < 3 && (
            <div className="mt-8 pt-6 border-t border-outline-variant/30">
              <button onClick={prevStep} className="flex items-center text-on-surface-variant font-bold hover:text-primary transition-colors text-sm">
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous Step
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}