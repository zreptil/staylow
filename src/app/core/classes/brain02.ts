import {SessionService} from '@/_services/session.service';
import {CardData} from '@/_models/card-data';
import {PlayerData} from '@/_models/player-data';

export class Brain02 {
  public player: PlayerData;

  constructor(public ss: SessionService) {
  }

  think_setup1(): CardData {
    return this.selectCoveredCard();
  }

  think_setup2(): CardData {
    return this.selectCoveredCard();
  }

  think_selectPile(): CardData {
    const card = this.ss.openPile[0];
    if (card.value < 5) {
      return card;
    }
    return this.ss.drawPile[0];
  }

  think_placeCard(): CardData {
    let card = this.findHighestCard();
    if (card != null && card.value > 4) {
      return card;
    }
    card = null;
    if (this.ss.currentCard.scope.type === 'openpile') {
      card = this.think_uncoverCard();
    } else {
      card = this.ss.openPile[0];
    }
    return card;
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

  selectCoveredCard(): CardData {
    let x, y;
    do {
      y = Math.floor(Math.random() * this.player.gameGrid.length);
      x = Math.floor(Math.random() * this.player.gameGrid[y].length);
    } while (this.player.gameGrid[y][x] == null || !this.player.gameGrid[y][x].coveredState);
    return this.player.gameGrid[y][x];
  }
}
