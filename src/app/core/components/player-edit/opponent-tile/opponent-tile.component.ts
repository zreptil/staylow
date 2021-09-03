import {Component, Input, OnInit} from '@angular/core';
import {Utils} from '@/core/classes/utils';
import {SessionService} from '@/_services/session.service';
import {PlayerData} from '@/_models/player-data';
import {Brain01} from '@/core/classes/brain01';

@Component({
  selector: 'app-opponent-tile',
  templateUrl: './opponent-tile.component.html',
  styleUrls: ['./opponent-tile.component.scss']
})
export class OpponentTileComponent {
  @Input()
  player: PlayerData;

  @Input()
  hideIcon = false;

  constructor(public ss: SessionService) {
  }

  boardStyle(idx: number): string {
    return `background-image:url("${this.ss.boardList.mask.replace(/@idx@/g, Utils.formatNumber(idx, 2))}") !important`;
  }
}
