import { WeatherDataTypes } from '../types/weather.model';

export const dataTypes: WeatherDataTypes = {
  temperature: {
    daily: 'temperature_2m_max',
    hourly: 'temperature_2m',
  },
  humidity: {
    daily: 'weather_code',
    hourly: 'relative_humidity_2m',
  },
  wind: {
    daily: 'rain_sum',
    hourly: 'wind_speed_10m',
  },
};
