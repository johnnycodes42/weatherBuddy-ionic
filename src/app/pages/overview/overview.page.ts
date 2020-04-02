import { Component, OnInit, destroyPlatform, ViewChild } from '@angular/core';
import { Platform, LoadingController, AlertController, IonSlides } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { WeatherService } from 'src/app/services/weather.service';
import { Storage } from '@ionic/storage';
import { forkJoin } from 'rxjs';

const CITIES_KEY = 'cities';
@Component({
   selector: 'app-overview',
   templateUrl: './overview.page.html',
   styleUrls: ['./overview.page.scss']
})
export class OverviewPage implements OnInit {

   @ViewChild('slides', { static: false }) slides: IonSlides;
   entries = [];
   units = this.weatherService.getUnits();
   loading = false;

   sliderConfig = {
      freeMode: true,
      spaceBetween: 5,
      slidesPerView: 3.3
   };

   constructor(
      private geolocation: Geolocation,
      private platform: Platform,
      private weatherService: WeatherService,
      private loadingCtrl: LoadingController,
      private alertCtrl: AlertController,
      private storage: Storage
   ) { }

   ngOnInit() {
      this.platform.ready().then(() => {
         this.geolocation
            .getCurrentPosition()
            .then(position => {
               console.log('test: ', position);
               this.entries.push({
                  type: 'geo',
                  val: position.coords,
                  class: 'cold'
               });
               this.loadWeather(0);
               this.loadCities();
            })
            .catch(error => {
               console.log('Error getting location', error);
            });
      });
   }

   loadWeather(index, forceRefresh = false) {
      if (this.entries[index].weather && !forceRefresh) {
         console.log('Already got weather!');
         return;
      }

      // this.getWeather(0).subscribe(res => {
      //    this.entries[0].weather = res;
      //    console.log('weather: ', res);
      // });

      // this.getForecast(0).subscribe(res => {
      //    this.entries[0].forecast = res;
      //    console.log('forecast: ', res);
      //    this.calculateNextDays(0);
      // });

      this.showLoading().then(() => {
         forkJoin([this.getWeather(index), this.getForecast(index)]).subscribe(res => {
            this.entries[index].weather = res[0];
            this.entries[index].forecast = res[1];
            console.log(res[1])
            this.calculateNextDays(index);
            this.setColorClass(index);

            if (this.loading) {
               this.loading = false;
               this.loadingCtrl.dismiss();
            }
         });
      });
   }
   getWeather(index) {
      const info = this.entries[index];
      return this.weatherService.getCurrentWeather(info);
   }

   getForecast(index) {
      const info = this.entries[index];
      return this.weatherService.getForecast(info);
   }

   getWeatherIcon(icon) {
      return this.weatherService.getWeatherIcon(icon);
   }

   changeUnits() {
      this.units = this.weatherService.changeUnits();

      for (let i = 0; i < this.entries.length; i++) {
         this.loadWeather(i, true);
      }
      // for (let i = 0; i < this.entries.length; i++) {
      //   this.loadWeather(i, true);
      // }
   }

   getUnitsString() {
      return this.units === 'metric' ? '°C' : '°F';
   }

   calculateNextDays(index) {
      const d = new Date();
      d.setHours(23, 59, 59, 59);
      let time = d.getTime() / 1000;

      this.entries[index].nextDays = [];

      let dayMin = null;
      let dayMax = null;

      for (const item of this.entries[index].forecast.list) {
         if (item.dt <= time) {
            if (!dayMin || item.main.temp_min < dayMin) {
               dayMin = item.main.temp_min;
            }

            if (!dayMax || item.main.temp_max > dayMax) {
               dayMax = item.main.temp_max;
            }
         } else {
            this.entries[index].nextDays.push({
               date: time * 1000,
               min: dayMin.toFixed(),
               max: dayMax.toFixed()
            });

            dayMin = item.main.temp.min;
            dayMax = item.main.temp.max;

            d.setDate(d.getDate() + 1);
            d.setHours(23, 59, 59, 59);
            time = d.getTime() / 1000;
         }
      }
      console.log('days:', this.entries[index].nextDays);
   }

   showLoading(): Promise<any> {
      if (!this.loading) {
         this.loading = true;
         return this.loadingCtrl.create({
            message: 'Loading...'
         }).then(loading => {
            loading.present();
            return true;
         });
      } else {
         return new Promise((resolve) => { resolve(null); });
      }
   }

   async addCity() {
      let alert = await this.alertCtrl.create({
         header: 'Add City',
         inputs: [
            {
               name: 'name',
               type: 'text',
               placeholder: 'New York'
            }
         ], buttons: [
            {
               text: 'Cancel',
               role: 'cancel'
            },
            {
               text: 'Add City',
               handler: (data) => {
                  let city = { type: 'city', val: data.name, nextDays: [], id: new Date().getTime(), class: 'cold' };
                  this.entries.push(city);
                  this.storeCity(city);

                  setTimeout(() => {
                     this.slides.slideTo(this.entries.length, 200);
                  }, 300);
               }
            }
         ]
      });
      alert.present();
   }

   cityChanged() {
      this.slides.getActiveIndex().then(index => {
         this.loadWeather(index);
      });
   }

   storeCity(city) {
      this.storage.get(CITIES_KEY).then(res => {
         if (!res) {
            this.storage.set(CITIES_KEY, [city]);
         } else {
            res.push(city);
            this.storage.set(CITIES_KEY, res);
         }
      });
   }

   loadCities() {
      this.storage.get(CITIES_KEY).then(res => {
         if (res) {
            // JS spread operator to push all results to entries
            this.entries.push(...res);
            for (let i = 1; i < this.entries.length; i++) {
               this.loadWeather(i);
            }
         }
      });
   }

   removeCity(index) {
      console.log('remove:', index);
      let toRemove = this.entries[index].id;
      let copy = Object.create(this.entries);
      this.entries = [];

      setTimeout(() => {
         this.entries = copy.filter(entry => entry.id != toRemove);
         this.slides.slideTo(index - 1, 200);
      }, 10);

      this.storage.get(CITIES_KEY).then(res => {
         let toKeep = res.filter(entry => entry.id != toRemove);
         this.storage.set(CITIES_KEY, toKeep);
      });
   }

   setColorClass(index) {
      if (this.entries[index].weather.main.temp.toFixed() <= 32) {
         this.entries[index].class = 'cold';
      } else if (this.entries[index].weather.main.temp.toFixed() > 32 && this.entries[index].weather.main.temp.toFixed() < 60) {
         this.entries[index].class = 'medium';
      } else {
         this.entries[index].class = 'warm';
      }
   }

}
