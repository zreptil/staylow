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
import {LayoutModule} from '@angular/cdk/layout';
import {PlayerEditComponent} from './core/components/player-edit/player-edit.component';
import {ImageSelectorComponent} from './core/components/player-edit/image-selector/image-selector.component';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';
import {OpponentTileComponent} from './core/components/player-edit/opponent-tile/opponent-tile.component';
import {OpponentSelectorComponent} from './core/components/player-edit/opponent-selector/opponent-selector.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {SettingsDialogComponent} from './core/components/config-dialog/settings-dialog.component';
import { WhatsnewComponent } from './core/components/whatsnew/whatsnew.component';

registerLocaleData(localeDe, 'de-DE');

@NgModule({
  declarations: [
    AppComponent,
    FrameComponent,
    GamingCardComponent,
    PlayerGridComponent,
    PlayerEditComponent,
    ImageSelectorComponent,
    OpponentTileComponent,
    OpponentSelectorComponent,
    SettingsDialogComponent,
    WhatsnewComponent
  ],
  imports: [
    BrowserModule,
    LayoutModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatBadgeModule,
    MatChipsModule,
    MatButtonToggleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
