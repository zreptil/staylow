import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from '@/_services/session.service';

@Component({
  selector: 'app-player-grid',
  templateUrl: './player-grid.component.html',
  styleUrls: ['./player-grid.component.scss']
})
export class PlayerGridComponent implements OnInit {
  @Input()
  player: number;

  constructor(public ss: SessionService) {
  }

  get visibleValue(): number {
    const player = this.ss.players[this.player];
    const grid = player?.gameGrid;
    let ret = 0;
    for (const row of grid) {
      for (const card of row) {
        if (!card.covered) {
          ret += card.value;
        }
      }
    }
    return ret;
  }

  ngOnInit(): void {
  }

}
