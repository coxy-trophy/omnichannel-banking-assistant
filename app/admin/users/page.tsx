import React from 'react';
export const dynamic = 'force-dynamic';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { getAllUsers } from '@/lib/adminActions';

export default async function AdminUsersPage() {
  const allUsers = await getAllUsers();

  return (
    <div className="min-h-screen bg-background p-8 font-inter text-on-background text-sm">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-manrope text-3xl font-bold flex items-center gap-3 text-primary">
            <Users size={32} /> Customer Repository
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline mt-1">Institutional Ledger</p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline" className="px-6 border-outline-variant shadow-sm text-xs">Back to Overview</Button>
        </Link>
      </header>

      <div className="mb-8 flex gap-3">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input 
            className="w-full pl-11 pr-4 h-12 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-xs font-medium" 
            placeholder="Query by name, email, or institutional UUID..."
          />
        </div>
        <Button variant="outline" className="h-12 w-12 p-0 border-outline-variant shadow-sm">
           <Filter size={18} />
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-outline-variant/30 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[10px] uppercase tracking-widest text-outline border-b border-outline-variant/30">
                <th className="p-5 font-bold">Profile</th>
                <th className="p-5 font-bold text-center">Authorization</th>
                <th className="p-5 font-bold">Compliance Status</th>
                <th className="p-5 font-bold text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs">
              {allUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center font-black text-primary text-[10px]">
                         {user.email?.[0].toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-on-background text-sm">{user.email || user.phone}</p>
                        <p className="text-[9px] text-outline font-mono mt-0.5 tracking-tighter uppercase">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface border border-outline-variant/30'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5 capitalize font-bold">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${user.kycStatus === 'verified' ? 'bg-success-mint' : user.kycStatus === 'pending' ? 'bg-tertiary' : 'bg-error'}`} />
                       {user.kycStatus}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <Button variant="outline" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-outline-variant/50">Manage</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
