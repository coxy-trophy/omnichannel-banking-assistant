'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, MapPin, DollarSign, Phone, Building, ArrowLeft, ExternalLink, Map } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const ATM_LOCATIONS = [
  // Accra ATMs (20 locations)
  { id: 1, name: 'Accra Central ATM', location: 'Independence Ave, Accra', type: 'ATM', available: true, lat: 5.5560, lng: -0.2026 },
  { id: 2, name: 'Osu Oxford St ATM', location: 'Oxford St, Osu, Accra', type: 'ATM', available: true, lat: 5.5558, lng: -0.1769 },
  { id: 3, name: 'Airport City ATM', location: 'Airport City, Accra', type: 'ATM', available: true, lat: 5.6052, lng: -0.1769 },
  { id: 4, name: 'East Legon ATM', location: 'American House, East Legon', type: 'ATM', available: true, lat: 5.6392, lng: -0.1618 },
  { id: 5, name: 'Spintex ATM', location: 'Spintex Road, Accra', type: 'ATM', available: true, lat: 5.6298, lng: -0.1356 },
  { id: 6, name: 'Tema Station ATM', location: 'Tema Station, Accra', type: 'ATM', available: false, lat: 5.5892, lng: -0.2276 },
  { id: 7, name: 'Kaneshie ATM', location: 'Kaneshie Market, Accra', type: 'ATM', available: true, lat: 5.5692, lng: -0.2376 },
  { id: 8, name: 'Circle ATM', location: 'Kwame Nkrumah Circle, Accra', type: 'ATM', available: true, lat: 5.5676, lng: -0.2156 },
  { id: 9, name: 'Adabraka ATM', location: 'Adabraka Market, Accra', type: 'ATM', available: true, lat: 5.5720, lng: -0.2056 },
  { id: 10, name: 'James Town ATM', location: 'James Town, Accra', type: 'ATM', available: false, lat: 5.5420, lng: -0.2076 },
  { id: 11, name: 'Labone ATM', location: 'Labone, Accra', type: 'ATM', available: true, lat: 5.5620, lng: -0.1756 },
  { id: 12, name: 'Cantonments ATM', location: 'Cantonments, Accra', type: 'ATM', available: true, lat: 5.5720, lng: -0.1756 },
  { id: 13, name: 'Tesano ATM', location: 'Tesano, Accra', type: 'ATM', available: true, lat: 5.6020, lng: -0.2156 },
  { id: 14, name: 'Achimota ATM', location: 'Achimota Mall, Accra', type: 'ATM', available: true, lat: 5.6220, lng: -0.2256 },
  { id: 15, name: 'Dansoman ATM', location: 'Dansoman, Accra', type: 'ATM', available: false, lat: 5.5520, lng: -0.2576 },
  { id: 16, name: 'Lapaz ATM', location: 'Lapaz, Accra', type: 'ATM', available: true, lat: 5.5920, lng: -0.2476 },
  { id: 17, name: 'Mallam ATM', location: 'Mallam, Accra', type: 'ATM', available: true, lat: 5.5720, lng: -0.2676 },
  { id: 18, name: 'Tema Community 1 ATM', location: 'Community 1, Tema', type: 'ATM', available: true, lat: 5.6692, lng: -0.0156 },
  { id: 19, name: 'Tema Harbour ATM', location: 'Tema Harbour', type: 'ATM', available: true, lat: 5.6192, lng: -0.0056 },
  { id: 20, name: 'Ashaiman ATM', location: 'Ashaiman, Accra', type: 'ATM', available: true, lat: 5.6892, lng: -0.0356 },
  // Other major cities
  { id: 21, name: 'Kumasi Regional ATM', location: 'Adum, Kumasi', type: 'ATM', available: true, lat: 6.6885, lng: -1.6244 },
  { id: 22, name: 'Takoradi Port ATM', location: 'Harbor Rd, Takoradi', type: 'ATM', available: false, lat: 4.8978, lng: -1.7537 },
  { id: 23, name: 'Tamale Main ATM', location: 'Commercial Rd, Tamale', type: 'ATM', available: true, lat: 9.4034, lng: -0.8424 },
];

const DEPOSIT_SERVICES = [
  { id: 1, name: 'Internal Deposit', type: 'Service', description: 'Deposit cash or checks at any branch', icon: DollarSign },
  { id: 2, name: 'MoMo Deposit', type: 'Service', description: 'Instant deposit via Mobile Money', icon: Phone },
  { id: 3, name: 'Branch Deposit', type: 'Service', description: 'Over-the-counter deposit service', icon: Building },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'all' | 'atm' | 'services'>('all');
  const [showMap, setShowMap] = useState(false);
  const [selectedAtm, setSelectedAtm] = useState<any>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = (searchQuery: string) => {
    const lowerQuery = searchQuery.toLowerCase();

    const atmResults = ATM_LOCATIONS.filter(atm =>
      atm.name.toLowerCase().includes(lowerQuery) ||
      atm.location.toLowerCase().includes(lowerQuery)
    );

    const serviceResults = DEPOSIT_SERVICES.filter(svc =>
      svc.name.toLowerCase().includes(lowerQuery) ||
      svc.description.toLowerCase().includes(lowerQuery)
    );

    if (searchType === 'atm') {
      setResults(atmResults.map(r => ({ ...r, category: 'ATM' })));
    } else if (searchType === 'services') {
      setResults(serviceResults.map(r => ({ ...r, category: 'Service' })));
    } else {
      setResults([
        ...atmResults.map(r => ({ ...r, category: 'ATM' })),
        ...serviceResults.map(r => ({ ...r, category: 'Service' })),
      ]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col text-on-background font-inter">
      <div className="max-w-4xl w-full mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-surface-container rounded-xl transition-all border border-transparent hover:border-outline-variant/30">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Link>
          <h1 className="font-manrope text-2xl font-bold text-primary tracking-tight">Search</h1>
        </header>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ATMs, deposit services..."
              className="w-full pl-12 pr-4 h-14 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-lg bg-surface-container-lowest"
            />
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={searchType === 'all' ? 'secondary' : 'outline'}
            onClick={() => { setSearchType('all'); performSearch(query); }}
            className="text-sm"
          >
            All Results
          </Button>
          <Button
            variant={searchType === 'atm' ? 'secondary' : 'outline'}
            onClick={() => { setSearchType('atm'); performSearch(query); setShowMap(true); }}
            className="text-sm"
          >
            ATMs
          </Button>
          <Button
            variant={searchType === 'services' ? 'secondary' : 'outline'}
            onClick={() => { setSearchType('services'); performSearch(query); setShowMap(false); }}
            className="text-sm"
          >
            Services
          </Button>
          <Button
            variant={showMap ? 'secondary' : 'outline'}
            onClick={() => setShowMap(!showMap)}
            className="text-sm gap-2"
          >
            <Map className="w-4 h-4" /> {showMap ? 'List View' : 'Map View'}
          </Button>
        </div>

        {/* Map View */}
        {showMap && searchType !== 'services' && results.filter(r => r.category === 'ATM').length > 0 && (
          <Card className="mb-6 overflow-hidden border-outline-variant/30">
            <div className="bg-primary/5 p-4 border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-primary">ATM Locations Map</h3>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">
                {results.filter(r => r.category === 'ATM').length} ATM(s) shown
              </span>
            </div>
            <div className="relative w-full h-[500px] bg-surface-container-low">
              {/* Custom SVG Map of Accra and surrounding areas */}
              <svg viewBox="0 0 800 400" className="w-full h-full">
                {/* Background - Land */}
                <rect width="800" height="400" fill="#f5f5f5" />

                {/* Gulf of Guinea (water) */}
                <path d="M 0 320 Q 200 300 400 290 Q 600 280 800 290 L 800 400 L 0 400 Z" fill="#a8d5e5" />

                {/* Major roads */}
                <path d="M 50 200 Q 200 180 400 170 Q 600 160 750 180" stroke="#d0d0d0" strokeWidth="3" fill="none" />
                <path d="M 300 50 Q 320 150 350 250" stroke="#d0d0d0" strokeWidth="3" fill="none" />
                <path d="M 100 100 Q 250 150 400 200" stroke="#d0d0d0" strokeWidth="2" fill="none" />

                {/* Area labels */}
                <text x="400" y="80" textAnchor="middle" className="text-xs fill-gray-400 font-bold" style={{fontSize: '12px'}}>NORTHERN AREAS</text>
                <text x="200" y="200" textAnchor="middle" className="text-xs fill-gray-400 font-bold" style={{fontSize: '11px'}}>ACCRA METRO</text>
                <text x="600" y="150" textAnchor="middle" className="text-xs fill-gray-400 font-bold" style={{fontSize: '11px'}}>TEMA</text>
                <text x="400" y="350" textAnchor="middle" className="text-xs fill-gray-500 font-bold" style={{fontSize: '11px'}}>Gulf of Guinea</text>

                {/* ATM Pins - Accra Central */}
                <g transform="translate(180, 220)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 1))}>
                  <circle cx="0" cy="0" r="20" fill={ATM_LOCATIONS.find(a => a.id === 1)?.available ? '#22c55e30' : '#ef444430'} className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill={ATM_LOCATIONS.find(a => a.id === 1)?.available ? '#22c55e' : '#ef4444'} />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Osu Oxford St */}
                <g transform="translate(280, 240)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 2))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Airport City */}
                <g transform="translate(240, 180)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 3))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* East Legon */}
                <g transform="translate(320, 160)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 4))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Spintex */}
                <g transform="translate(380, 190)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 5))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Tema Station */}
                <g transform="translate(120, 180)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 6))}>
                  <circle cx="0" cy="0" r="20" fill="#ef444430" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#ef4444" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Kaneshie */}
                <g transform="translate(100, 210)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 7))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Circle */}
                <g transform="translate(150, 200)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 8))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Adabraka */}
                <g transform="translate(200, 195)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 9))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* James Town */}
                <g transform="translate(190, 250)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 10))}>
                  <circle cx="0" cy="0" r="20" fill="#ef444430" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#ef4444" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Labone */}
                <g transform="translate(300, 220)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 11))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Cantonments */}
                <g transform="translate(260, 200)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 12))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Tesano */}
                <g transform="translate(160, 160)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 13))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Achimota */}
                <g transform="translate(130, 140)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 14))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Dansoman */}
                <g transform="translate(60, 230)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 15))}>
                  <circle cx="0" cy="0" r="20" fill="#ef444430" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#ef4444" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Lapaz */}
                <g transform="translate(100, 170)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 16))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Mallam */}
                <g transform="translate(50, 200)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 17))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Tema Community 1 */}
                <g transform="translate(520, 170)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 18))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Tema Harbour */}
                <g transform="translate(560, 200)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 19))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>

                {/* Ashaiman */}
                <g transform="translate(480, 150)" className="cursor-pointer" onClick={() => setSelectedAtm(ATM_LOCATIONS.find(a => a.id === 20))}>
                  <circle cx="0" cy="0" r="20" fill="#22c55e30" className="animate-pulse" />
                  <path d="M 0 -15 Q 8 -5 8 5 Q 8 12 0 18 Q -8 12 -8 5 Q -8 -5 0 -15" fill="#22c55e" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                </g>
              </svg>

              {/* Selected ATM Info Overlay */}
              {selectedAtm && (
                <div className="absolute top-4 right-4 bg-background border border-outline-variant/30 rounded-xl p-4 shadow-2xl max-w-xs z-10">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-primary">{selectedAtm.name}</h4>
                    <button onClick={() => setSelectedAtm(null)} className="text-outline hover:text-on-surface">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-2">{selectedAtm.location}</p>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    selectedAtm.available ? 'bg-success-mint text-on-success-mint' : 'bg-error/10 text-error'
                  }`}>
                    {selectedAtm.available ? 'Available' : 'Out of Service'}
                  </span>
                  {selectedAtm.available && (
                    <Link href="/deposit">
                      <Button variant="outline" className="w-full mt-2 text-xs py-2 h-auto">
                        Make Deposit
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-background/90 border border-outline-variant/30 rounded-xl p-3 shadow-lg">
                <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-2">Legend</p>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-success-mint" />
                  <span className="text-xs text-on-surface">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-error" />
                  <span className="text-xs text-on-surface">Out of Service</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* List Results */}
        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result, idx) => (
              <Card key={`${result.category}-${result.id}`} className="p-5 border-outline-variant/30 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      result.category === 'ATM'
                        ? result.available ? 'bg-success-mint/20' : 'bg-error/10'
                        : 'bg-primary/10'
                    }`}>
                      {result.category === 'ATM' ? (
                        <MapPin className={`w-6 h-6 ${result.available ? 'text-on-success-mint' : 'text-error'}`} />
                      ) : (
                        <result.icon className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{result.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                          result.category === 'ATM'
                            ? result.available ? 'bg-success-mint text-on-success-mint' : 'bg-error/10 text-error'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {result.category}
                        </span>
                      </div>
                      {result.location ? (
                        <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {result.location}
                        </p>
                      ) : (
                        <p className="text-sm text-on-surface-variant mt-1">{result.description}</p>
                      )}
                    </div>
                  </div>
                  {result.category === 'ATM' && result.available && (
                    <Link href="/deposit">
                      <Button variant="outline" className="gap-1 text-xs px-3 py-2 h-auto">
                        Deposit <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : query ? (
          <Card className="p-12 text-center border-dashed border-2 border-outline-variant/50">
            <Search className="w-12 h-12 text-outline mx-auto mb-4" />
            <p className="text-on-surface-variant font-medium">No results found for "{query}"</p>
            <p className="text-xs text-outline mt-2">Try searching for ATM locations or deposit services</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => { setQuery('ATM'); performSearch('ATM'); setSearchType('atm'); }}>
              <MapPin className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-lg mb-1">Find ATMs</h3>
              <p className="text-sm text-on-surface-variant">Locate ATMs near you for deposits and withdrawals</p>
            </Card>
            <Card className="p-6 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => { setQuery('deposit'); performSearch('deposit'); setSearchType('services'); }}>
              <DollarSign className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-lg mb-1">Deposit Services</h3>
              <p className="text-sm text-on-surface-variant">Explore deposit options: internal, MoMo, branch</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
