'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getPointsOfInterest } from '@/ai/flows/get-points-of-interest';
import type { LocationData, Poi } from '@/lib/types';
import { Map, Plane, ShoppingCart, Trees } from 'lucide-react';

type PoisSectionProps = {
  locationData: LocationData | null;
};

const iconMap: { [key: string]: React.ElementType } = {
  Park: Trees,
  Airport: Plane,
  Market: ShoppingCart,
  default: Map,
};

const PoisSection = ({ locationData }: PoisSectionProps) => {
  const [pois, setPois] = useState<Poi[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (locationData) {
      setLoading(true);
      setPois(null);
      getPointsOfInterest({ location: `${locationData.city}, ${locationData.countryName}` })
        .then(response => {
          setPois(response.pointsOfInterest);
        })
        .catch(err => {
          // Fail silently on AI errors
          setPois([]); // Set to empty array on error to stop loading
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
          <Map className="text-accent" />
          Points of Interest
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && pois && pois.length > 0 && (
          <ul className="space-y-4">
            {pois.map((poi, index) => {
              const Icon = iconMap[poi.type] || iconMap.default;
              return (
                <li key={index} className="flex items-start gap-4 bg-background/50 p-3 rounded-lg border">
                  <Icon className="w-6 h-6 mt-1 text-primary" />
                  <div>
                    <h4 className="font-semibold">{poi.name}</h4>
                    <p className="text-sm text-muted-foreground">{poi.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {!loading && (!pois || pois.length === 0) && (
          <p className="text-muted-foreground text-center">Could not retrieve suggestions at this time.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PoisSection;
