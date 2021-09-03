import {Component} from '@angular/core';
import {SessionService} from '@/_services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'staylow';

  constructor(public ss: SessionService) {
  }
}
