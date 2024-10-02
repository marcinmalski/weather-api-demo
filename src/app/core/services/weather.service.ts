import { Injectable } from '@angular/core';
import moment from 'moment';

import { fetchWeatherApi } from 'openmeteo';
import { CalendarWeatherMode, WeatherTypeMode } from '../types/weather.model';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  async fetchWeatherData(
    currentYear: number,
    mode: CalendarWeatherMode,
    type: WeatherTypeMode,
    latitude: number = 0,
    longitude: number = 0
  ) {
    let startDate, endDate;

    switch (mode) {
      case 'daily':
        startDate = moment()
          .year(currentYear)
          .startOf('day')
          .format('YYYY-MM-DD');
        endDate = moment().year(currentYear).endOf('day').format('YYYY-MM-DD');
        break;
      case 'weekly':
        startDate = moment()
          .year(currentYear)
          .startOf('week')
          .format('YYYY-MM-DD');
        endDate = moment().year(currentYear).endOf('week').format('YYYY-MM-DD');
        break;
      case 'monthly':
        startDate = moment()
          .year(currentYear)
          .startOf('month')
          .format('YYYY-MM-DD');
        endDate = moment()
          .year(currentYear)
          .endOf('month')
          .format('YYYY-MM-DD');
        break;
      case 'yearly':
      default:
        startDate = moment()
          .year(currentYear)
          .startOf('year')
          .format('YYYY-MM-DD');
        endDate = moment().year(currentYear).endOf('year').format('YYYY-MM-DD');
    }

    let params: any = {
      latitude: latitude,
      longitude: longitude,
      start_date: startDate,
      end_date: endDate,
    };

    switch (mode) {
      case 'weekly':
      case 'monthly':
      case 'yearly':
        params = {
          ...params,
          daily:
            type === 'temperature'
              ? 'temperature_2m_max'
              : type === 'humidity'
              ? 'weather_code'
              : 'rain_sum',
        };
        break;
      default:
        params = {
          ...params,
          hourly:
            type === 'temperature'
              ? 'temperature_2m'
              : type === 'humidity'
              ? 'relative_humidity_2m'
              : 'wind_speed_10m',
        };
        break;
    }

    const url = 'https://archive-api.open-meteo.com/v1/era5';
    const responses = await fetchWeatherApi(url, params);

    const range = (start: number, stop: number, step: number) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();

    const hourly = ['weekly', 'monthly', 'yearly'].includes(mode)
      ? response.daily()!
      : response.hourly();
    if (!hourly) {
      const hourly = {
        time: [] as any,
        values: [] as any,
      };
      return { hourly };
    }
    const weatherData = {
      hourly: {
        time: range(
          Number(hourly.time()),
          Number(hourly.timeEnd()),
          hourly.interval()
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000).getTime()),
        values: hourly.variables(0)!.valuesArray()!,
      },
    };
    return weatherData;
  }
}
