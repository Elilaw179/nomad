import TeamSection from '@/components/team-section';
import WeatherDashboard from '@/components/weather-dashboard';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start bg-background p-4 md:p-8 pt-12 md:pt-24">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold font-headline text-foreground">
          GeoWeather
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your intelligent weather companion.
        </p>
      </div>
      <WeatherDashboard />
      <TeamSection />
    </main>
  );
}
