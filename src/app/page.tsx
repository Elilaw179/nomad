'use client';

import { useState, useCallback } from 'react';
import HeroSection from '@/components/hero-section';
import TeamSection from '@/components/team-section';
import WeatherDashboard from '@/components/weather-dashboard';
import HotelsSection from '@/components/hotels-section';
import PoisSection from '@/components/pois-section';
import { LocationData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLocationChange = useCallback((
    newLocation: { lat: number; lon: number } | null,
    newLocationData: LocationData | null,
    isLoading: boolean,
  ) => {
    setLocation(newLocation);
    setLocationData(newLocationData);
    setLoading(isLoading);
  }, []);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start bg-background">
      <HeroSection />
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start p-4 md:p-8 -mt-24 z-20 max-w-7xl mx-auto">
        <div className="lg:col-span-1">
          {loading && !locationData ? <Skeleton className="h-96 w-full" /> : <HotelsSection locationData={locationData} />}
        </div>
        <div className="lg:col-span-1">
          <WeatherDashboard onLocationChange={handleLocationChange} />
        </div>
        <div className="lg:col-span-1">
          {loading && !locationData ? <Skeleton className="h-96 w-full" /> : <PoisSection locationData={locationData} />}
        </div>
      </div>
      <div className="w-full flex flex-col items-center p-4 md:p-8 z-20">
        <TeamSection />
      </div>
    </main>
  );
}
