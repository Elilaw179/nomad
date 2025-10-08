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
  imageUrl: string;
}
