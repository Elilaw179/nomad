"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Wind, Droplets, AlertCircle, Loader2, XCircle, Thermometer } from 'lucide-react';
import { intelligentWeatherAlerts } from '@/ai/flows/intelligent-weather-alerts';
import type { LocationData, WeatherData } from '@/lib/types';
import { getWeatherInfo } from '@/lib/weather-utils';
import { Button } from './ui/button';

const StatusDisplay = ({ icon, title, message, onRetry }: { icon: React.ElementType, title: string, message: string, onRetry?: () => void }) => (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 space-y-2">
        {React.createElement(icon, { className: "w-12 h-12 mb-4 text-destructive" })}
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="max-w-xs">{message}</p>
        {onRetry && <Button onClick={onRetry} variant="outline" className="mt-4">Try Again</Button>}
    </div>
);

export default function WeatherDashboard() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [aiAlert, setAiAlert] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(new Date());
  }, []);

  const handleGeoError = useCallback((error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError("Location access was denied. Please enable it in your browser settings to use this app.");
        break;
      case error.POSITION_UNAVAILABLE:
        setError("Your location information is currently unavailable.");
        break;
      case error.TIMEOUT:
        setError("The request to get your location timed out.");
        break;
      default:
        setError("An unknown error occurred while trying to get your location.");
        break;
    }
    setLoading(false);
  }, []);

  const requestGeolocation = useCallback(() => {
    setLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setError(null);
        },
        handleGeoError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, [handleGeoError]);
  
  useEffect(() => {
    requestGeolocation();
  }, [requestGeolocation]);

  useEffect(() => {
    if (!location) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [locationRes, weatherRes] = await Promise.all([
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.lat}&longitude=${location.lon}&localityLanguage=en`),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`)
        ]);

        if (!locationRes.ok || !weatherRes.ok) {
          throw new Error('Failed to fetch weather or location data.');
        }

        const locData = await locationRes.json();
        const weathData = await weatherRes.json();
        
        setLocationData({ city: locData.city || locData.locality, countryName: locData.countryName });
        const current = weathData.current;
        const currentWeatherData: WeatherData = {
          temperature: Math.round(current.temperature_2m),
          weatherCode: current.weather_code,
          windSpeed: Math.round(current.wind_speed_10m),
          humidity: current.relative_humidity_2m,
          isDay: current.is_day
        };
        setWeatherData(currentWeatherData);
        
        const historicalWeatherData = `The historical average temperature for ${locData.city} this time of year is around ${Math.round(current.temperature_2m + (Math.random() - 0.5) * 5)}°C with variable cloudiness.`;
        const weatherInfo = getWeatherInfo(currentWeatherData.weatherCode, currentWeatherData.isDay);

        const alertResponse = await intelligentWeatherAlerts({
          currentWeather: weatherInfo.description,
          temperature: currentWeatherData.temperature,
          historicalWeatherData: historicalWeatherData,
          location: `${locData.city}, ${locData.countryName}`
        });
        setAiAlert(alertResponse.alertMessage);

      } catch (e) {
        console.error(e);
        setError("Could not fetch weather data. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  const renderContent = () => {
    if (loading) {
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

    if (error) {
        return <StatusDisplay icon={XCircle} title="An Error Occurred" message={error} onRetry={requestGeolocation} />;
    }

    if (!weatherData || !locationData || !date) {
      return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

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
          
          {aiAlert && (
            <Alert className="mt-6 text-left bg-accent/10 border-accent/30 shadow-inner">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent font-bold font-headline">Intelligent Alert</AlertTitle>
              <AlertDescription className="text-accent-foreground/80">
                {aiAlert}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </>
    );
  };
  
  return (
    <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm border rounded-2xl overflow-hidden">
      {renderContent()}
    </Card>
  );
}
