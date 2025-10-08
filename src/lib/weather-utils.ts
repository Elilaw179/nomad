import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Snowflake, Zap, CloudFog, Moon } from 'lucide-react';

export function getWeatherInfo(code: number, isDay: number) {
  const day = isDay === 1;
  switch (code) {
    case 0:
      return { description: 'Clear sky', Icon: day ? Sun : Moon, animation: day ? 'animate-spin-slow' : '' };
    case 1:
      return { description: 'Mainly clear', Icon: day ? Sun : Moon, animation: day ? 'animate-spin-slow' : '' };
    case 2:
      return { description: 'Partly cloudy', Icon: Cloud, animation: 'animate-float' };
    case 3:
      return { description: 'Overcast', Icon: Cloud, animation: 'animate-float' };
    case 45:
    case 48:
      return { description: 'Fog', Icon: CloudFog, animation: 'animate-float' };
    case 51:
    case 53:
    case 55:
      return { description: 'Drizzle', Icon: CloudRain, animation: 'animate-float' };
    case 61:
    case 63:
    case 65:
      return { description: 'Rain', Icon: CloudRain, animation: 'animate-float' };
    case 66:
    case 67:
      return { description: 'Freezing Rain', Icon: CloudSnow, animation: 'animate-float' };
    case 71:
    case 73:
    case 75:
      return { description: 'Snow fall', Icon: Snowflake, animation: 'animate-pulse' };
    case 77:
      return { description: 'Snow grains', Icon: Snowflake, animation: 'animate-pulse' };
    case 80:
    case 81:
    case 82:
      return { description: 'Rain showers', Icon: CloudRain, animation: 'animate-float' };
    case 85:
    case 86:
      return { description: 'Snow showers', Icon: CloudSnow, animation: 'animate-float' };
    case 95:
      return { description: 'Thunderstorm', Icon: Zap, animation: 'animate-pulse' };
    case 96:
    case 99:
      return { description: 'Thunderstorm with hail', Icon: Zap, animation: 'animate-pulse' };
    default:
      return { description: 'Clear sky', Icon: day ? Sun : Moon, animation: day ? 'animate-spin-slow' : '' };
  }
}
