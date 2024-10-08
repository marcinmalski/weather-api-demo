export type CalendarWeatherMode = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type WeatherTypeMode = 'temperature' | 'humidity' | 'wind';
export type WeatherDataTypes = {
  [key in WeatherTypeMode]: {
    daily: string;
    hourly: string;
  };
};
