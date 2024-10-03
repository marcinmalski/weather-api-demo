import moment from 'moment';
import { CalendarWeatherMode } from '../types/weather.model';

export function formatTimestampToDateTime(
  timestamp: number,
  mode: CalendarWeatherMode
): string {
  switch (mode) {
    case 'daily':
      return moment(timestamp).format('HH:mm');
    case 'weekly':
      return moment(timestamp).format('ddd');
    case 'monthly':
      return moment(timestamp).format('MMM D');
    case 'yearly':
      return moment(timestamp).format('MMM D, YYYY');
    default:
      return '';
  }
}
