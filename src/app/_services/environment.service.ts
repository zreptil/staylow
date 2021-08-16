import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {log, LoggerService, LogLevel} from '@/_services/logger.service';
import { version } from 'src/environments/version';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  public production: boolean;
  public version = version;

  constructor(private ls: LoggerService) {
    log.create(ls, this, LogLevel.debug);
    this.production = environment.production;
  }
}
