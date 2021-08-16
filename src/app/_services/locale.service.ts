import { Injectable } from '@angular/core';
import { LOCALE_ID, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {

  constructor(@Inject(LOCALE_ID) public locale: string) {}


  public getLocale(): string {
    return localStorage.getItem('language') || this.locale;
  }
}
