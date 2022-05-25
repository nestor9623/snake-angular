import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BestScoreManager } from './app.storage.service';
import { CommonModule } from '@angular/common';
import { SelectColorsComponent } from './select-colors/select-colors.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    SelectColorsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule
  ],
  providers: [
    BestScoreManager
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
