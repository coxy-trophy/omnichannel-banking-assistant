import React from 'react';
export const dynamic = 'force-dynamic';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  BarChart3,
  MessageSquare,
  Settings,
  Search,
  Bell,
  UserCircle,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  MoreVertical,
  PieChart,
  Activity,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { getAdminStats, getRecentInquiries } from '@/lib/adminActions';
import { generateFakeReports } from '@/lib/reportGenerator';

export default async function AdminDashboard() {
  const [stats, inquiries, reports] = await Promise.all([
    getAdminStats(),
    getRecentInquiries(),
    generateFakeReports()
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-background font-inter text-on-background">
      {/* Institutional Sidebar */}
      <nav className="bg-surface-container-lowest font-manrope text-sm font-semibold h-screen w-64 border-r border-outline-variant hidden md:flex flex-col py-6 sticky left-0 top-0 transition-all duration-200 z-30 flex-shrink-0">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-black text-primary flex items-center gap-2">
            <span className="bg-primary text-on-primary w-8 h-8 rounded-lg flex items-center justify-center text-[10px]">AC</span>
            Admin Console
          </h1>
          <p className="text-[9px] uppercase tracking-widest text-outline mt-1 font-bold">Institutional Portal</p>
        </div>
        
        <ul className="flex flex-col gap-1 flex-grow px-2">
          <NavItem active icon={<LayoutDashboard size={18} />} label="Overview" href="/admin/dashboard" />
          <NavItem icon={<Calendar size={18} />} label="Bookings" href="/admin/bookings" />
          <NavItem icon={<UserCheck size={18} />} label="KYC Queue" href="/admin/kyc" />
          <NavItem icon={<BarChart3 size={18} />} label="User Data" href="/admin/users" />
          <NavItem 
            icon={<MessageSquare size={18} />} 
            label="Inquiries" 
            badge={stats.activeAlerts.toString()}
            href="/admin/complaints"
          />
        </ul>
        
        <div className="mt-auto px-4">
          <NavItem icon={<Settings size={18} />} label="System Settings" href="#" />
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-surface-container-lowest backdrop-blur-md font-manrope tracking-tight text-sm border-b border-outline-variant shadow-sm sticky top-0 z-40 flex justify-between items-center w-full px-6 h-16 transition-all duration-200 flex-shrink-0">
          <div className="md:hidden">
            <span className="text-lg font-extrabold text-primary">Bank Ledger</span>
          </div>
          
          <div className="flex-1 max-w-md md:mx-4 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input 
              className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-9 pr-12 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
              placeholder="Search customers, cases, or transactions..." 
              type="text"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-outline hover:bg-surface-container rounded-full relative transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-error rounded-full border border-surface-container-lowest"></span>
            </button>
            <Link href="/" className="p-2 text-outline hover:bg-surface-container rounded-full transition-colors">
              <UserCircle size={18} />
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-[1280px] mx-auto space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="font-manrope text-3xl font-bold text-on-background">Overview</h2>
                <p className="text-xs text-on-surface-variant font-medium">Real-time system health and service metrics.</p>
              </div>
              <div className="flex items-center gap-2">
                <a href="/api/reports/excel" download>
                  <Button variant="outline" className="gap-2 px-4 py-2 text-xs border-outline-variant shadow-sm">
                    <FileSpreadsheet size={14} />
                    Excel
                  </Button>
                </a>
                <a href="/api/reports/pdf" download>
                  <Button className="gap-2 px-4 py-2 text-xs shadow-lg shadow-primary/20">
                    <FileText size={14} />
                    Bank Ledger PDF
                  </Button>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Total Ledger Vol" 
                value={`GH₵ ${(Number(stats.totalVolume) / 1000).toFixed(1)}k`} 
                trend="+12.5%" 
                up 
                icon={<BarChart3 />} 
              />
              <MetricCard 
                title="KYC Pending" 
                value={stats.pendingKyc.toString()} 
                trend="-2.1%" 
                icon={<UserCheck />} 
                color="surface-tint"
              />
              <MetricCard 
                title="Active Bookings" 
                value={stats.todayBookings.toString()} 
                trend="+8.4%" 
                up 
                icon={<LayoutDashboard />} 
                color="secondary"
              />
              <MetricCard 
                title="Institutional Alerts" 
                value={stats.activeAlerts.toString()} 
                trend="Critical" 
                icon={<AlertTriangle />} 
                color="tertiary"
              />
            </div>

            {/* Visual Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-outline-variant/30 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-manrope text-lg font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" /> Daily Activity Ledger
                    </h3>
                    <p className="text-[10px] text-outline uppercase font-bold tracking-widest">Transaction Trends</p>
                  </div>
                  <MoreVertical size={16} className="text-outline" />
                </div>
                <div className="h-48 flex items-end justify-between gap-2 px-4">
                  {reports.dailyBookings.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40 relative group"
                        style={{ height: `${(day.count / 50) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.count}
                        </div>
                      </div>
                      <span className="text-[8px] font-bold text-outline uppercase">{day.day.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-outline-variant/30 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-manrope text-lg font-bold flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-primary" /> Channel Mix
                    </h3>
                    <p className="text-[10px] text-outline uppercase font-bold tracking-widest">Service Distribution</p>
                  </div>
                </div>
                <div className="space-y-6">
                   <div className="relative h-32 w-32 mx-auto">
                      <div className="absolute inset-0 border-[12px] border-primary-container rounded-full" />
                      <div className="absolute inset-0 border-[12px] border-primary rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 20% 0%)' }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-xl font-black text-primary">{reports.atmVsBranchUsage.app}%</span>
                      </div>
                   </div>
                   <div className="space-y-3 pt-4 border-t border-outline-variant/30">
                      <UsageItem color="bg-primary" label="MoMo Transfers" percent={`${reports.atmVsBranchUsage.app}%`} />
                      <UsageItem color="bg-primary-container" label="Withdrawals" percent={`${reports.atmVsBranchUsage.atm}%`} />
                      <UsageItem color="bg-surface-tint" label="Branch Deposits" percent={`${reports.atmVsBranchUsage.branch}%`} />
                   </div>
                </div>
              </Card>
            </div>

            <Card className="p-0 overflow-hidden border-outline-variant/30 shadow-md">
              <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
                <h3 className="font-manrope text-lg font-bold">Recent Customer Inquiries</h3>
                <Link href="/admin/complaints" className="text-primary font-bold text-xs hover:underline uppercase tracking-widest">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-[9px] uppercase tracking-widest text-outline border-b border-outline-variant/30">
                      <th className="p-4 font-bold">Customer Profile</th>
                      <th className="p-4 font-bold">Inquiry Category</th>
                      <th className="p-4 font-bold">Date Received</th>
                      <th className="p-4 font-bold">Resolution Status</th>
                      <th className="p-4 font-bold text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-outline-variant/20">
                    {inquiries.length > 0 ? inquiries.map((iq: any) => (
                      <InquiryRow 
                        key={iq.id}
                        initials={iq.user?.email?.[0].toUpperCase() || 'U'} 
                        name={iq.user?.email || 'Guest User'} 
                        id={iq.id.slice(0, 8)} 
                        subject={iq.category} 
                        date={new Date(iq.createdAt).toLocaleDateString()} 
                        status={iq.status === 'open' ? 'Urgent' : 'Resolved'} 
                      />
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-outline italic">No active inquiries found in ledger</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, badge, href }: any) {
  return (
    <li>
      <Link 
        href={href} 
        className={`rounded-xl mx-2 flex items-center justify-between gap-3 px-4 py-2.5 transition-all duration-200 ${
          active 
            ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
            : 'text-on-surface-variant hover:bg-surface-container'
        }`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="tracking-tight">{label}</span>
        </div>
        {badge && badge !== "0" && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20 text-white' : 'bg-error/10 text-error'}`}>
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}

function MetricCard({ title, value, trend, up, icon, color = "primary" }: any) {
  const colorMap: any = {
    primary: "bg-primary/5 text-primary border-primary/10",
    "surface-tint": "bg-surface-tint/5 text-surface-tint border-surface-tint/10",
    secondary: "bg-secondary/5 text-secondary border-secondary/10",
    tertiary: "bg-error/5 text-error border-error/10",
  };

  return (
    <Card className={`relative overflow-hidden border ${colorMap[color]} shadow-none`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white shadow-sm border border-black/5">
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
          up ? 'bg-success-mint text-on-success-mint' : 'bg-error/10 text-error'
        }`}>
          {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend}
        </span>
      </div>
      <p className="text-outline text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-manrope font-bold text-on-surface">{value}</h3>
    </Card>
  );
}

function UsageItem({ color, label, percent }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-[10px] font-bold text-on-surface uppercase tracking-tight">{label}</span>
      </div>
      <span className="text-[10px] font-black text-primary">{percent}</span>
    </div>
  );
}

function InquiryRow({ initials, name, id, subject, date, status }: any) {
  const statusStyles: any = {
    Resolved: "bg-success-mint text-on-success-mint border-success-mint/50",
    Urgent: "bg-error/5 text-error border-error/20",
  };

  return (
    <tr className="hover:bg-surface-container-low transition-colors cursor-pointer group">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px]">
            {initials}
          </div>
          <div>
            <p className="font-bold text-on-background text-xs">{name}</p>
            <p className="text-[8px] text-outline font-bold tracking-widest">{id}</p>
          </div>
        </div>
      </td>
      <td className="p-4 font-medium">{subject}</td>
      <td className="p-4 text-outline font-medium">{date}</td>
      <td className="p-4">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${statusStyles[status] || 'bg-surface-container text-on-surface'}`}>
          {status}
        </span>
      </td>
      <td className="p-4 text-right">
        <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
          <ChevronRight size={16} />
        </button>
      </td>
    </tr>
  );
}
