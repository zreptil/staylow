import {DatePipe} from '@angular/common';
import {isArray} from 'rxjs/internal-compatibility';
import {LocaleService} from '@/_services/locale.service';

export class Utils {
  private static instance: Utils;

  constructor(private ls: LocaleService) {
  }

  static get baseUrl(): string {
    let ret = window.location.origin;
    ret = ret.replace(/\/\//, '');
    const pos = ret.lastIndexOf('/');
    if (pos >= 0) {
      ret = ret.substring(pos);
    } else {
      ret = '';
    }
    return ret;
  }

  static isEmpty(data: any): boolean {
    if (data == null) {
      return true;
    }
    if (isArray(data)) {
      return data.length === 0;
    }
    if (typeof data === 'string') {
      return data.trim() === '';
    }

    return true;
  }

  static isEqual(a: any, b: any): boolean {
    if (Utils.isEmpty(a) && Utils.isEmpty(b)) {
      return true;
    }
    return a === b;
  }

  /**
   * Fügt die Einträge der übergebenen Liste mit dem angegebenen
   * Separator zu einem String zusammen, wobei NULL-Werte verworfen werden.
   * @param list Liste der zusammenzuführenden Texte.
   * @param separator Separator, der zwischen den Texten eingefügt wird.
   */
  static join(list: string[], separator: string): string {
    return list.filter(elem => {
      return elem != null && elem.trim() !== '';
    }).join(separator);
  }

  static create(ls: LocaleService): void {
    Utils.instance = new Utils(ls);
  }

  static plural(value, options): string {
    if (options[value] !== undefined) {
      return options[value];
    }
    return options.other;
  }

  static clone(src: any): any {
    const ret = {};
    if (src) {
      Object.keys(src).forEach(key => {
        ret[key] = src[key];
      });
    }
    return ret;
  }

  // Wandelt aus dem numerischen DB-Datum 'yyymmdd' ein formatiertes Datum 'dd.mm.yyyy' als String
  static formatDate(value: number): string {
    const dp = new DatePipe(Utils.instance.ls.locale);
    const src = value + '';
    let ret = '';
    if (src.length === 8) {
      const year = +src.substring(0, 4);
      const month = +src.substring(4, 6);
      const day = +src.substring(6, 8);
      ret = dp.transform(new Date(year, month - 1, day), 'mediumDate');
    }
    return ret;
  }

  // Wandelt das numerische DB-Datum 'yyymmdd' in ein Datum vom Typ 'Date'
  static getDate(value: number): Date {
    const dp = new DatePipe(Utils.instance.ls.locale);
    const src = value + '';
    let ret: Date = null;
    if (src.length === 8) {
      const year = +src.substring(0, 4);
      const month = +src.substring(4, 6);
      const day = +src.substring(6, 8);
      ret = new Date(month + '/' + day + '/' + year);
    }
    return ret;
  }

  // Prüfen ob es sich um ein Schaltjahr handelt
  static isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  // Die Differenz zwischen Start- und Enddatum in Jahren als Dezimalzahl
  static getDiffInYears(dateFrom: Date, dateTo: Date): number {
    // Gesamtanzahl der Tage
    const days: number = Math.floor((dateTo.getTime() - dateFrom.getTime()) / 1000 / 3600 / 24);

    // Berechnung der Differenz in Jahren
    const years: number = days / (this.isLeapYear(dateTo.getFullYear()) ? 366 : 365);

    return years;
  }

  // Die Nachkommastellen einer Dezimalzahl abschneiden (nicht runden)
  static cutNumber(value: number, decimalPlaces: number): number {
    const numPower = Math.pow(10, decimalPlaces);
    // tslint:disable-next-line:no-bitwise
    return ~~(value * numPower) / numPower;
  }

  /**
   * @https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references
   * dazu kommt Newline: &#13;&#10;
   * @param sValue String, in dem die Zeichen ersetzt werden sollen.
   */
  static replaceXmlSpecialChar(sValue: any): string {
    if (typeof sValue !== 'string') {
      return sValue;
    } else {
      if (sValue.includes('&#13;&#10;', 0)) {
        sValue = sValue.replace(/&#13;&#10;/g, '\n');
      }
      sValue = sValue.replace(/&lt;/g, '<');
      sValue = sValue.replace(/&gt;/g, '>');
      sValue = sValue.replace(/&/g, '&#38;');
      sValue = sValue.replace(/\n/g, '&#13;&#10;');
      sValue = sValue.replace(/€/g, '&#8364;');
      sValue = sValue.replace(/</g, '&lt;');
      sValue = sValue.replace(/>/g, '&gt;');
      // console.log(`xmlFormatiere: ${sValue} `);
      return sValue;
    }
  }

  static snakeToCamel(src: string, fcUpper = false): string {
    let ret = src.toLowerCase().replace(/([-_]\w)/g, g => g[1].toUpperCase());
    if (fcUpper && ret.length > 0) {
      ret = ret[0].toUpperCase() + ret.substr(1);
    }
    return ret;
  }

  static camelToSnake(src: string, fcUpper = false): string {
    // AP: Das wäre der einfache Weg, wenn iOS inzwischen in der Lage wäre,
    //     regular Expressions aufzulösen, die (?<!^) beinhalten. Ist es aber
    //     auch drei Jahre nachdem der Fehler aufgefallen ist leider nicht.
    //     Deswegen schlagen wir hier einen umfangreicheren Weg ein.
    // let ret = src.replace(/(?<!^)([A-Z][a-z]|(?<=[a-z])[A-Z])/g, '_$&');
    let ret = '';
    // tslint:disable-next-line:forin
    for (let i = 0; i < src.length; i++) {
      let c = src.charAt(i);
      if (c >= 'A' && c <= 'Z') {
        c = '_' + c.toLowerCase();
      }
      ret += c;
    }
    // console.log('KamelZur_schlange', src, ret);
    if (fcUpper && ret.length > 0) {
      ret = ret[0].toUpperCase() + ret.substr(1);
    }
    return ret;
  }

  static getPropertiesOf(obj: any, match: string): string[] {
    const props = [];
    do {
      props.push(...Object.getOwnPropertyNames(obj));
      obj = Object.getPrototypeOf(obj);
    } while (obj != null);

    const regexp = new RegExp(match);
    return props.filter(entry => {
      return regexp.test(entry);
    });
  }
}
