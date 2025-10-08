import HeroSection from '@/components/hero-section';
import TeamSection from '@/components/team-section';
import WeatherDashboard from '@/components/weather-dashboard';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start bg-background">
      <HeroSection />
      <div className="w-full flex flex-col items-center p-4 md:p-8 -mt-24 z-20">
        <WeatherDashboard />
        <TeamSection />
      </div>
    </main>
  );
}
