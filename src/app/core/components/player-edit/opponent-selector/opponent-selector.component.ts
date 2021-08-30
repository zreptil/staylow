import {Component} from '@angular/core';
import {SessionService} from '@/_services/session.service';
import {PlayerData} from '@/_models/player-data';

@Component({
  selector: 'app-opponent-selector',
  templateUrl: './opponent-selector.component.html',
  styleUrls: ['./opponent-selector.component.scss']
})
export class OpponentSelectorComponent {
  list: PlayerData[] = [];

  constructor(public ss: SessionService) {
    for (let i = 0; i < ss.opponentDefs.length; i++) {
      this.list.push(ss.createPlayer({opponentIdx: i}));
    }
  }
}
