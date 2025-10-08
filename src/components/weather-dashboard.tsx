'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Wind, Droplets, AlertCircle, Loader2, XCircle, Search, Info } from 'lucide-react';
import { intelligentWeatherAlerts } from '@/ai/flows/intelligent-weather-alerts';
import { getLocationDetails } from '@/ai/flows/get-location-details';
import type { LocationData, WeatherData, LocationDetails } from '@/lib/types';
import { getWeatherInfo } from '@/lib/weather-utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
    
const StatusDisplay = ({ icon, title, message, onRetry }: { icon: React.ElementType, title: string, message: string, onRetry?: () => void }) => (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 space-y-2">
        {React.createElement(icon, { className: "w-12 h-12 mb-4 text-destructive" })}
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="max-w-xs">{message}</p>
        {onRetry && <Button onClick={onRetry} variant="outline" className="mt-4">Try Again</Button>}
    </div>
);

type WeatherDashboardProps = {
  onLocationChange: (location: { lat: number, lon: number } | null, locationData: LocationData | null, loading: boolean) => void;
};

export default function WeatherDashboard({ onLocationChange }: WeatherDashboardProps) {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [aiAlert, setAiAlert] = useState<string | null>(null);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingAIData, setLoadingAIData] = useState(false);
  
  const [date, setDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const resetState = useCallback(() => {
    setWeatherData(null);
    setLocationData(null);
    setAiAlert(null);
    setLocationDetails(null);
    setErrorMessage(null);
    onLocationChange(null, null, true);
  }, [onLocationChange]);

  const fetchAllData = useCallback(async (loc: { lat: number; lon: number }) => {
    resetState();
    setStatus('loading');

    try {
      const [weatherRes, locationRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`),
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lon}`)
      ]);

      if (!weatherRes.ok) throw new Error(`Weather data fetch failed with status: ${weatherRes.status}`);
      if (!locationRes.ok) throw new Error(`Location data fetch failed with status: ${locationRes.status}`);
      
      const weatherJson = await weatherRes.json();
      const locationJson = await locationRes.json();

      const fetchedLocationData = { city: locationJson.address.city || locationJson.address.town || locationJson.address.village || locationJson.address.county, countryName: locationJson.address.country };
      setLocationData(fetchedLocationData);

      const current = weatherJson.current;
      const currentWeatherData: WeatherData = {
        temperature: Math.round(current.temperature_2m),
        weatherCode: current.weather_code,
        windSpeed: Math.round(current.wind_speed_10m),
        humidity: current.relative_humidity_2m,
        isDay: current.is_day
      };
      setWeatherData(currentWeatherData);
      
      setStatus('success');
      onLocationChange(loc, fetchedLocationData, false);

      setLoadingAIData(true);
      try {
        const locationString = `${fetchedLocationData.city}, ${fetchedLocationData.countryName}`;
        const [alertResponse, locationDetailsResponse] = await Promise.all([
            intelligentWeatherAlerts({
                currentWeather: getWeatherInfo(currentWeatherData.weatherCode, currentWeatherData.isDay).description,
                temperature: currentWeatherData.temperature,
                historicalWeatherData: `The historical average temperature for ${locationString} this time of year is around ${Math.round(currentWeatherData.temperature + (Math.random() - 0.5) * 5)}°C.`,
                location: locationString
            }),
            getLocationDetails({ location: locationString })
        ]);
        setAiAlert(alertResponse.alertMessage);
        setLocationDetails(locationDetailsResponse);
      } catch (aiError) {
        // Fail silently on AI errors (e.g. rate limiting)
        setAiAlert(null);
        setLocationDetails(null);
      } finally {
        setLoadingAIData(false);
      }

    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unknown error occurred.";
      console.error(e);
      setErrorMessage(`Could not fetch data. ${message}`);
      setStatus('error');
      onLocationChange(loc, null, false);
    }
  }, [onLocationChange, resetState]);
  
  const requestGeolocation = useCallback(() => {
    setStatus('loading');
    setErrorMessage(null);
    onLocationChange(null, null, true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setLocation(newLocation);
          fetchAllData(newLocation);
        },
        (error) => {
          let message = "An unknown error occurred while trying to get your location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Location access was denied. Please enable it or use the search bar.";
              break;
            case error.POSITION_UNAVAILABLE:
              message = "Your location information is currently unavailable.";
              break;
            case error.TIMEOUT:
              message = "The request to get your location timed out.";
              break;
          }
          setErrorMessage(message);
          setStatus('error');
          onLocationChange(null, null, false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setErrorMessage("Geolocation is not supported by your browser. Please use the search bar.");
      setStatus('error');
      onLocationChange(null, null, false);
    }
  }, [fetchAllData, onLocationChange]);

  useEffect(() => {
    setDate(new Date());
    requestGeolocation();
  }, [requestGeolocation]);


  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setStatus('loading');
    resetState();

    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1`);
      if (!geoRes.ok) {
        throw new Error(`Failed to find location (status: ${geoRes.status}).`);
      }
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Could not find a location named "${searchQuery}".`);
      }
      const { latitude, longitude } = geoData.results[0];
      const newLocation = { lat: latitude, lon: longitude };
      setLocation(newLocation);
      await fetchAllData(newLocation);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error(err);
      setErrorMessage(message);
      setStatus('error');
      onLocationChange(null, null, false);
    }
  };
  
  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          <Skeleton className="h-32 w-32 rounded-full mx-auto" />
          <div className="text-center space-y-2">
            <Skeleton className="h-16 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-1/3 mx-auto" />
          </div>
          <div className="flex justify-around pt-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-1/4" />
          </div>
          <Skeleton className="h-20 w-full mt-4" />
        </div>
      );
    }

    if (status === 'error') {
        return <StatusDisplay icon={XCircle} title="An Error Occurred" message={errorMessage || "Something went wrong."} onRetry={requestGeolocation} />;
    }

    if (status === 'success' && weatherData && locationData && date) {
      const { Icon, description, animation } = getWeatherInfo(weatherData.weatherCode, weatherData.isDay);
      return (
        <>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl flex items-center justify-center gap-2 font-headline">
              <MapPin className="text-accent h-7 w-7" />
              {locationData.city}, {locationData.countryName}
            </CardTitle>
            <CardDescription className="text-base">
              {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-4 sm:px-6">
            <div className="my-4">
              <Icon className={`w-32 h-32 mx-auto text-primary ${animation}`} strokeWidth={1.5} />
            </div>
            <p className="text-7xl lg:text-8xl font-bold font-headline text-foreground">{weatherData.temperature}°C</p>
            <p className="text-xl text-muted-foreground capitalize mt-2">{description}</p>
            
            <div className="flex justify-center gap-6 sm:gap-8 mt-8 text-muted-foreground border-t pt-6">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-accent" />
                <span className="font-medium">{weatherData.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-accent" />
                <span className="font-medium">{weatherData.humidity}%</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 p-4 pt-0">
            {loadingAIData ? (
              <div className="w-full space-y-4">
                  <Skeleton className="h-24 w-full rounded-lg"/>
                  <Skeleton className="h-24 w-full rounded-lg"/>
              </div>
            ) : (
              <>
                {aiAlert && (
                  <Alert className="text-left bg-accent/10 border-accent/30 shadow-inner w-full">
                    <AlertCircle className="h-4 w-4 text-accent" />
                    <AlertTitle className="text-accent font-bold font-headline">Intelligent Alert</AlertTitle>
                    <AlertDescription className="text-accent-foreground/80">
                      {aiAlert}
                    </AlertDescription>
                  </Alert>
                )}
                {locationDetails && (
                  <Alert className="text-left bg-blue-500/10 border-blue-500/30 shadow-inner w-full">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertTitle className="text-blue-500 font-bold font-headline">About {locationData.city}</AlertTitle>
                    <AlertDescription className="text-foreground/80">
                      {locationDetails.description}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardFooter>
        </>
      );
    }
    return <StatusDisplay icon={XCircle} title="An Error Occurred" message="Something went wrong. Please try again." onRetry={requestGeolocation} />;
  };
  
  return (
    <Card className="w-full h-full shadow-2xl bg-card/80 backdrop-blur-sm border rounded-2xl overflow-hidden">
      <div className="p-4 border-b">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            type="search"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={status === 'loading' || !searchQuery}>
            {status === 'loading' ? <Loader2 className="animate-spin" /> : <Search />}
            <span className="sr-only">Search</span>
          </Button>
          <Button type="button" size="icon" variant="outline" onClick={requestGeolocation} disabled={status === 'loading'}>
            <MapPin />
            <span className="sr-only">Use my location</span>
          </Button>
        </form>
      </div>
      {renderContent()}
    </Card>
  );
}

    