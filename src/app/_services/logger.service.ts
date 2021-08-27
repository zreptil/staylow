import {DatePipe} from '@angular/common';
import {Injectable} from '@angular/core';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {catchError, timeout} from 'rxjs/operators';
import {of, Subject, Subscription} from 'rxjs';
import {environment} from '../../environments/environment';
import {EnvironmentService} from '@/_services/environment.service';

export enum LogLevel {
  off = -1,
  debug,
  info,
  warn,
  error,
  fatal
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  datepipe: DatePipe = new DatePipe('de-DE');
  public level = LogLevel.debug;
  private logApi: string = null;
  private user = '';

  constructor(private http: HttpClient) {
  }

  private get timestamp(): string | null {
    return this.datepipe.transform(new Date(), 'dd.MM.yyyy hh:mm:ss');
  }

  setUser(user: string): void {
    this.user = user;
  }

  connect(url: string): void {
    this.writeToWeb($localize`${this.timestamp} Logging gestartet`, url);
  }

  output(lvl: LogLevel, message?: any, ...optionalParams: any[]): void {
    if (this.level > lvl || lvl < 0) {
      return;
    }

    const info = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'][lvl];
    let method = console.log;
    if (lvl >= LogLevel.error) {
      method = console.error;
    }

    if (false && !environment.production) {
      const caller = (new Error()).stack?.split('\n')[3].trim();

      method(message, ...optionalParams, caller, this.timestamp, info);
    } else {
      method(info, message, ...optionalParams);
    }

    if (this.logApi != null) {
      const params = {...optionalParams};
      Object.keys(params).forEach(key => {
        message += ' ' + JSON.stringify(params[key]);
      });
      this.writeToWeb(`${this.timestamp} ${info} ${message}`);
    }
  }

  stacktrace(lvl: LogLevel, message?: any, ...optionalParams: any[]): void {
    if (this.level > lvl || lvl < 0) {
      return;
    }

    const info = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'][lvl];
    let method = console.log;
    if (lvl >= LogLevel.error) {
      method = console.error;
    }

    if (!environment.production) {
      // const caller = (new Error()).stack.split('\n')[3].trim();
      let caller = (new Error()).stack;
      const stack = caller?.split('\n');
      stack?.splice(1, 2);
      caller = stack?.join('\n');

      method(this.timestamp, info, message, ...optionalParams, caller);
    } else {
      method(info, message, ...optionalParams);
    }

    if (this.logApi != null) {
      const params = {...optionalParams};
      Object.keys(params).forEach(key => {
        message += ' ' + JSON.stringify(params[key]);
      });
      this.writeToWeb(`${this.timestamp} ${info} ${message}`);
    }
  }

  private writeToWeb(message: string, url?: string): void {
    if (!url) {
      url = this.logApi;
    }
    if (!url) {
      return;
    }
    const req = new HttpRequest('POST', url, {msg: message, user: this.user}, {
      reportProgress: true,
      responseType: 'text'
    });
    let result: any | null = null;
    this.http.request(req).pipe(timeout(2000), catchError(e => {
        this.logApi = undefined;
        return of($localize`Der Log-Server hat nicht geantwortet`);
      }
    )).subscribe(
      (response: any) => {
        result = response.body;
      },
      response => {
        // console.error('Fehler beim Aufruf von', req, response);
      },
      () => {
        if (result != null) {
          this.logApi = url;
        } else {
          this.logApi = undefined;
          console.log($localize`Der Log-Server unter ${url} ist nicht verfügbar`);
        }
      }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export class log {
  private static instance: log;
  public logEvent = new Subject();
  private logSub: Subscription = null;

  constructor(private ls: LoggerService, public env: EnvironmentService) {
    this.logSub = this.logEvent.asObservable().subscribe((msg: string) => {
    });
  }

  static create(ls: LoggerService, env: EnvironmentService, level: LogLevel): void {
    log.instance = new log(ls, env);
  }

  static stacktrace(message?: any, ...optionalParams: any[]): void {
    log.instance.ls.stacktrace(LogLevel.debug, message, ...optionalParams);
  }

  static debug(message?: any, ...optionalParams: any[]): void {
    log.instance.ls.output(LogLevel.debug, message, ...optionalParams);
  }

  static info(message?: any, ...optionalParams: any[]): void {
    log.instance.ls.output(LogLevel.info, message, ...optionalParams);
  }

  static warn(message?: any, ...optionalParams: any[]): void {
    log.instance.ls.output(LogLevel.warn, message, ...optionalParams);
  }

  static error(message?: any, ...optionalParams: any[]): void {
    log.instance.ls.output(LogLevel.error, message, ...optionalParams);
    log.instance.logEvent?.next(message);
  }

  static fatal(message?: any, ...optionalParams: any[]): void {
    log.instance.ls.output(LogLevel.fatal, message, ...optionalParams);
  }

  static connect(url: string): void {
    log.instance.ls.connect(url);
  }

  static setUser(user: string): void {
    log.instance.ls.setUser(user);
  }

  static listen(event: (msg: string) => void): void {
    log.instance.logEvent.subscribe((msg: string) => {
      event(msg);
    });
  }
}
