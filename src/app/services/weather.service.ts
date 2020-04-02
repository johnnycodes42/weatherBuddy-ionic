import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
   providedIn: 'root'
})
export class WeatherService {
   private apiKey = '33cdc307ea8dcef4107284124ab00267';
   private units = 'metric'; // imperial
   private baseURL = 'https://api.openweathermap.org/data/2.5';

   constructor(private http: HttpClient) { }

   getCurrentWeather(info) {
      if (info.type === 'geo') {
         return this.http.get(`${this.baseURL}/weather?lat=${info.val.latitude}&lon=${info.val.longitude}&APPID=${this.apiKey}&units=${this.units}`);
      } else {
         return this.http.get(`${this.baseURL}/weather?q=${info.val}&APPID=${this.apiKey}&units=${this.units}`);
      }
   }

   getForecast(info) {
      if (info.type === 'geo') {
         return this.http.get(`${this.baseURL}/forecast?lat=${info.val.latitude}&lon=${info.val.longitude}&APPID=${this.apiKey}&units=${this.units}`);
      } else {
         return this.http.get(`${this.baseURL}/forecast?q=${info.val}&APPID=${this.apiKey}&units=${this.units}`);
      }
   }

   getUnits() {
      return this.units;
   }

   changeUnits() {
      return this.units = this.units === 'metric' ? 'imperial' : 'metric';
   }

   getWeatherIcon(icon) {
      return `http://openweathermap.org/img/w/${icon}.png`;
   }
}
