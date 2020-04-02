import { Component, OnInit, Input } from '@angular/core';
import { WeatherService } from 'src/app/services/weather.service';

@Component({
   selector: 'app-hour-block',
   templateUrl: './hour-block.component.html',
   styleUrls: ['./hour-block.component.scss'],
})
export class HourBlockComponent implements OnInit {

   @Input() data: any;
   @Input() units: string;


   constructor(private weatherService: WeatherService) { }

   ngOnInit() { }

   getWeatherIcon(icon) {
      return this.weatherService.getWeatherIcon(icon);
   }

   getUnitsString() {
      return this.units === 'metric' ? '°C' : '°F';
   }

}
