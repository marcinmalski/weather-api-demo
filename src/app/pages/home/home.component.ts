import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { WeatherService } from '../../core/services/weather.service';
import { formatTimestampToDateTime } from '../../core/utils/date';
import {
  CalendarWeatherMode,
  WeatherTypeMode,
} from '../../core/types/weather.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  addressForm: FormGroup;
  coordinates: { lat: number; lng: number } | null = null;
  error = '';
  series: any[] = [];
  xAxisData: any[] = [];
  chartOption: EChartsOption = {};
  weatherOptions = [
    { label: 'Temperature', value: 'temperature' },
    { label: 'Humidity', value: 'humidity' },
    { label: 'Wind speed', value: 'wind' },
  ];
  selectedWeatherMode: WeatherTypeMode = 'temperature';

  calendarOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  selectedCalendarMode: CalendarWeatherMode = 'weekly';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private weatherService: WeatherService,
    private cdr: ChangeDetectorRef
  ) {
    this.addressForm = this.fb.group({
      address: ['', Validators.required],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.setSeriesData();
  }

  async setSeriesData() {
    const data = await this.weatherService.fetchWeatherData(
      2023,
      this.selectedCalendarMode,
      this.selectedWeatherMode,
      this.coordinates?.lat,
      this.coordinates?.lng
    );
    this.series = Array.from(data.hourly.values);
    this.xAxisData = data.hourly.time;
    this.updateChartOption();
    this.cdr.detectChanges();
  }

  updateChartOption() {
    this.chartOption = {
      title: {
        text: `${
          this.weatherOptions.find((x) => x.value === this.selectedWeatherMode)
            ?.label
        } Change`,
      },
      tooltip: {
        formatter: (params: any) => {
          const value = params.value;
          const time = params.name;
          return `
            <div>
              ${formatTimestampToDateTime(
                Number(time),
                this.selectedCalendarMode
              )}<br>
              ${params.marker}<strong>Value:</strong> ${value.toFixed(2)}°C
            </div>
          `;
        },
      },
      grid: {
        left: 10,
        right: 10,
        containLabel: true,
      },
      legend: {},
      toolbox: {
        show: true,
        feature: {
          dataView: { readOnly: false },
          magicType: { type: ['line', 'bar'] },
          restore: {},
          myTool: {
            show: true,
            title: 'Save as Json',
            icon: 'image://icons/json-download.webp',
            onclick: () => {
              (this as any).downloadWeatherData();
            },
          },
        },
      },
      xAxis: {
        data: this.xAxisData,
        axisLabel: {
          formatter: (value: any) => {
            return formatTimestampToDateTime(
              Number(value),
              this.selectedCalendarMode
            );
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: `{value} ${
            this.selectedWeatherMode === 'temperature'
              ? '°C'
              : this.selectedWeatherMode === 'humidity'
              ? '%'
              : 'm'
          }`,
        },
      },
      series: {
        data: this.series,
        type: 'line',
        smooth: true,
      },
    };
  }

  async onSelectionCalendarChange(value: any) {
    this.selectedCalendarMode = value;
    await this.setSeriesData();
  }

  async onSelectionWeatherChange(value: any) {
    this.selectedWeatherMode = value;
    await this.setSeriesData();
  }

  async onSubmit() {
    const address = this.addressForm.get('address')?.value;

    if (!address) {
      this.addressForm.markAllAsTouched();
      return;
    }
    await this.getCoordinates(address);
  }

  async getCoordinates(address: string) {
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${environment.googleMapsApiKey}`;
    const response: any = await this.http.get(apiUrl).toPromise();
    if (response.status === 'OK' && response.results.length) {
      const location = response.results[0].geometry.location;
      this.coordinates = {
        lat: location.lat,
        lng: location.lng,
      };
      await this.setSeriesData();
    } else {
      this.error = 'Address not found!';
    }
  }

  downloadWeatherData() {
    const data = {
      mode: this.selectedWeatherMode,
      calendar: this.selectedCalendarMode,
      series: this.series,
      xAxis: this.xAxisData,
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'weather_data.json';
    a.click();

    URL.revokeObjectURL(url);
  }
}
