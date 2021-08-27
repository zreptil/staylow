import {Component, OnInit} from '@angular/core';
import {SessionService} from '@/_services/session.service';
import {CardData} from '@/_models/card-data';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent {

  constructor(public ss: SessionService) {
  }

  get hiddenStackCardPre(): CardData {
    return this.ss.drawPile.length > 1 ? this.ss.drawPile[1] : null;
  }

  get hiddenStackCard(): CardData {
    return this.ss.drawPile[0];
  }

  get openStackCardPre(): CardData {
    return this.ss.openPile.length > 1 ? this.ss.openPile[1] : null;
  }

  get openStackCard(): CardData {
    return this.ss.openPile[0];
  }

  classForGrid(player: number): string[] {
    const ret = [];
    if (this.ss.currentPlayerIdx !== player) {
      ret.push('inactive');
    }
    return ret;
  }

  hiddenStackClick(): void {
    if (this.ss.drawPile.length > 0) {
      const card = this.ss.getFromPile(this.ss.drawPile);
      if (card != null) {
        card.uncover();
        card.scope.type = 'openpile';
        this.ss.openPile.splice(0, 0, card);
      }
    }
  }
}
