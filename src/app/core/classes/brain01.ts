import {SessionService} from '@/_services/session.service';
import {CardData} from '@/_models/card-data';
import {PlayerData} from '@/_models/player-data';

export class Brain01 {
  public player: PlayerData;
  public level = 1;

  protected constructor(public ss: SessionService) {
  }

  create(ss: SessionService): Brain01 {
    return Brain01.factory(ss);
  }

  static factory(ss: SessionService): Brain01 {
    return new Brain01(ss);
  }

  think_setup1(): CardData {
    return this.selectCoveredCard();
  }

  think_setup2(): CardData {
    return this.selectCoveredCard();
  }

  think_selectPile(): CardData {
    if (Math.random() > 0.5) {
      return this.ss.openPile[0];
    }
    return this.ss.drawPile[0];
  }

  think_placeCard(): CardData {
    if (this.ss.currentCard.scope.type === 'openpile') {
      return this.selectAnyCard();
    }
    if (Math.random() > 0.5) {
      return this.ss.openPile[0];
    }
    return this.selectAnyCard();
  }

  think_uncoverCard(): CardData {
    return this.selectCoveredCard();
  }

  findHighestCard(): CardData {
    let found = null;
    for (const row of this.player.gameGrid) {
      for (const card of row) {
        if (card != null && !card.coveredState && card.value > (found?.value || -3)) {
          found = card;
        }
      }
    }
    return found;
  }

  selectAnyCard(): CardData {
    let x, y;
    do {
      y = Math.floor(Math.random() * this.player.gameGrid.length);
      x = Math.floor(Math.random() * this.player.gameGrid[y].length);
    } while (this.player.gameGrid[y][x] == null);
    return this.player.gameGrid[y][x];
  }

  selectCoveredCard(): CardData {
    let x, y;
    do {
      y = Math.floor(Math.random() * this.player.gameGrid.length);
      x = Math.floor(Math.random() * this.player.gameGrid[y].length);
    } while (this.player.gameGrid[y][x] == null || !this.player.gameGrid[y][x].coveredState);
    return this.player.gameGrid[y][x];
  }
}
