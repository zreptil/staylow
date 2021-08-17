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

  get classForTable(): string[] {
    const ret = [];
    if (this.ss.currentPlayerIdx >= 0 && this.player !== this.ss.currentPlayerIdx) {
      ret.push('inactive');
    }
    return ret;
  }

  ngOnInit(): void {
  }

}
