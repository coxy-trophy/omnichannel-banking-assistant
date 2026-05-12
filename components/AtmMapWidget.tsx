'use client';

import React from 'react';
import dynamic from 'next/dynamic';

interface AtmLocation {
  id: number;
  name: string;
  location: string;
  lat: number;
  lng: number;
  available: boolean;
  category: string;
}

interface AtmMapWidgetProps {
  atms: AtmLocation[];
  center: [number, number];
}

// Dynamic import with ssr: false inside the client component
const AtmMap = dynamic(() => import('./AtmMap'), { ssr: false });

export default function AtmMapWidget({ atms, center }: AtmMapWidgetProps) {
  return (
    <AtmMap
      atms={atms}
      center={center}
      onAtmSelect={() => {}}
      selectedAtm={null}
    />
  );
}
