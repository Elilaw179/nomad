'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getHotels } from '@/ai/flows/get-hotels';
import type { LocationData } from '@/lib/types';
import { Hotel } from 'lucide-react';

type HotelsSectionProps = {
  locationData: LocationData | null;
};

const HotelsSection = ({ locationData }: HotelsSectionProps) => {
  const [hotels, setHotels] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (locationData) {
      setLoading(true);
      setHotels(null);
      getHotels({ location: `${locationData.city}, ${locationData.countryName}` })
        .then(response => {
          setHotels(response.hotels);
        })
        .catch(err => {
          console.error("Failed to fetch hotels:", err);
          setHotels([]); // Set to empty array on error to stop loading
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [locationData]);

  return (
    <Card className="w-full h-full shadow-lg bg-card/80 backdrop-blur-sm border rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Hotel className="text-accent" />
          Hotels & Lodging
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}
        {!loading && hotels && hotels.length > 0 && (
          <ul className="space-y-3">
            {hotels.map((hotel, index) => (
              <li key={index} className="bg-background/50 p-3 rounded-lg border">
                {hotel}
              </li>
            ))}
          </ul>
        )}
        {!loading && (!hotels || hotels.length === 0) && (
          <p className="text-muted-foreground text-center">No hotel information available for this location.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default HotelsSection;
