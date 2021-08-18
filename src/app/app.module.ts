import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FrameComponent} from './core/components/frame/frame.component';
import {GamingCardComponent} from './core/components/gaming-card/gaming-card.component';
import {PlayerGridComponent} from './core/components/player-grid/player-grid.component';
import localeDe from '@angular/common/locales/de';
import {HttpClientModule} from '@angular/common/http';
import {registerLocaleData} from '@angular/common';
import {MaterialModule} from '@/material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

registerLocaleData(localeDe, 'de-DE');

@NgModule({
  declarations: [
    AppComponent,
    FrameComponent,
    GamingCardComponent,
    PlayerGridComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
