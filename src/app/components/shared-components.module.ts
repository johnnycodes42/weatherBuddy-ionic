import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HourBlockComponent } from './hour-block/hour-block.component';



@NgModule({
  declarations: [HourBlockComponent],
  imports: [
    CommonModule
  ],
  exports: [HourBlockComponent]
})
export class SharedComponentsModule { }
