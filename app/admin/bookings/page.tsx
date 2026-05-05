import React from 'react';
export const dynamic = 'force-dynamic';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, CheckCircle2, Clock, User, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { getAllBookings } from '@/lib/adminActions';

export default async function AdminBookingsPage() {
  const bookings = await getAllBookings();

  return (
    <div className="min-h-screen bg-background p-8 font-inter text-on-background text-sm">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-manrope text-3xl font-bold flex items-center gap-3 text-primary">
            <Calendar size={32} /> Appointment Management
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline mt-1 italic">Institutional Daily Schedule</p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline" className="px-6 border-outline-variant shadow-sm text-xs">Return to Console</Button>
        </Link>
      </header>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
         <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4 group-focus-within:text-primary transition-colors" />
            <input 
              className="w-full pl-11 pr-4 h-12 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-xs font-medium bg-surface-container-lowest" 
              placeholder="Search by customer, code, or branch..."
            />
         </div>
         <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none text-[10px] uppercase font-bold tracking-widest border-outline-variant">Filter Date</Button>
            <Button variant="outline" className="flex-1 sm:flex-none text-[10px] uppercase font-bold tracking-widest border-outline-variant">Export XLS</Button>
         </div>
      </div>

      <Card className="p-0 overflow-hidden border-outline-variant/30 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[9px] uppercase tracking-widest text-outline border-b border-outline-variant/30">
                <th className="p-5 font-bold">Appointment Code</th>
                <th className="p-5 font-bold">Customer Profile</th>
                <th className="p-5 font-bold">Institutional Service</th>
                <th className="p-5 font-bold text-center">Schedule</th>
                <th className="p-5 font-bold text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs">
              {bookings.length > 0 ? bookings.map((bk: any) => (
                <tr key={bk.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="p-5">
                    <div className="bg-surface-container-highest px-3 py-1.5 rounded-lg border border-outline-variant/30 inline-block">
                       <p className="font-mono font-black text-primary tracking-tighter text-sm">{bk.checkinCode}</p>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                         <User size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-on-background">{bk.user?.email || bk.user?.phone || 'Unknown'}</p>
                        <p className="text-[8px] text-outline font-black uppercase tracking-widest">Client Ledger ID</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-primary">{bk.service?.name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-outline font-medium mt-0.5">
                       <MapPin size={10} />
                       {bk.branch?.name}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex flex-col items-center">
                       <p className="font-manrope font-black text-on-surface tracking-tight">{new Date(bk.timeslot).toLocaleDateString()}</p>
                       <div className="flex items-center gap-1 text-[10px] text-outline font-bold mt-0.5 bg-surface-container-low px-2 py-0.5 rounded">
                          <Clock size={10} />
                          {new Date(bk.timeslot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                       <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest mr-2 flex items-center ${
                         bk.status === 'upcoming' ? 'bg-primary/10 text-primary border border-primary/20' :
                         bk.status === 'checked_in' ? 'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant border border-tertiary-fixed-dim/30' :
                         bk.status === 'completed' ? 'bg-success-mint text-on-success-mint border border-success-mint/50' :
                         'bg-error/10 text-error border border-error/20'
                       }`}>
                         {bk.status}
                       </span>
                       <Button variant="outline" className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Action</Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-outline font-black italic uppercase tracking-[0.2em] text-sm opacity-50">
                    No institutional appointments scheduled for this cycle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
