export interface LocationData {
  city: string;
  countryName: string;
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  isDay: number;
}

export interface LocationDetails {
  description: string;
}

export interface Poi {
  name: string;
  type: 'Park' | 'Airport' | 'Market' | 'Landmark' | 'Attraction';
  description: string;
}
