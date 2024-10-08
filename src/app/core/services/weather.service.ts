import { Injectable } from '@angular/core';
import moment from 'moment';

import { fetchWeatherApi } from 'openmeteo';
import { CalendarWeatherMode, WeatherTypeMode } from '../types/weather.model';
import { LondonRomeLocation } from '../config/location';
import { dataTypes } from '../config/weather';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private url = 'https://archive-api.open-meteo.com/v1/era5';

  async fetchWeatherData(
    currentYear: number,
    mode: CalendarWeatherMode,
    type: WeatherTypeMode,
    latitude: number = LondonRomeLocation.latitude,
    longitude: number = LondonRomeLocation.longitude
  ) {
    let startDate: string;
    let endDate: string;

    const baseDate = moment().year(currentYear);

    switch (mode) {
      case 'daily':
        startDate = baseDate.clone().startOf('day').format('YYYY-MM-DD');
        endDate = baseDate.clone().endOf('day').format('YYYY-MM-DD');
        break;
      case 'weekly':
        startDate = baseDate.clone().startOf('week').format('YYYY-MM-DD');
        endDate = baseDate.clone().endOf('week').format('YYYY-MM-DD');
        break;
      case 'monthly':
        startDate = baseDate.clone().startOf('month').format('YYYY-MM-DD');
        endDate = baseDate.clone().endOf('month').format('YYYY-MM-DD');
        break;
      case 'yearly':
      default:
        startDate = baseDate.clone().startOf('year').format('YYYY-MM-DD');
        endDate = baseDate.clone().endOf('year').format('YYYY-MM-DD');
    }

    let params: any = {
      latitude: latitude,
      longitude: longitude,
      start_date: startDate,
      end_date: endDate,
    };

    const isDailyMode = ['weekly', 'monthly', 'yearly'].includes(mode);
    const dataType = isDailyMode
      ? dataTypes[type].daily
      : dataTypes[type].hourly;

    params = {
      ...params,
      [isDailyMode ? 'daily' : 'hourly']: dataType,
    };

    const responses = await fetchWeatherApi(this.url, params);

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
