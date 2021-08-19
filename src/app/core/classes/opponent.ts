import {SessionService} from '@/_services/session.service';
import {PlayerData} from '@/_models/player-data';
import {CardData} from '@/_models/card-data';
import {log} from '@/_services/logger.service';

export class Opponent extends PlayerData {
  constructor(public ss: SessionService,
              name: string) {
    super(name);
  }

  execute(func: string): void {
    if (this.isDone) {
      this.ss.nextPlayer();
      return;
    }
    let cmd = `exec_${func}`;
    if (this[cmd]) {
      log.error(this.name, cmd);
      const card = this[cmd]();
      if (card != null) {
        cmd = `click_${func}`;
        log.info(this.name, cmd, card);
        this.ss[cmd](card);
      }
    }
  }

  exec_setup1(): CardData {
    return this.selectCoveredCard();
  }

  exec_setup2(): CardData {
    return this.selectCoveredCard();
  }

  exec_drawFromPile(): CardData {
    const card = this.ss.openPile[0];
    if (card.value < 5) {
      return card;
    }
    return this.ss.drawPile[0];
  }

  exec_placeCard(): CardData {
    let card = this.findHighestCard();
    console.log('high', card);
    if (card != null && card.value > 4) {
      return card;
    }
    card = null;
    if (this.ss.currentCard.scope.type === 'openpile') {
      card = this.exec_uncoverCard();
    } else {
      card = this.ss.openPile[0];
    }
    return card;
  }

  exec_uncoverCard(): CardData {
    return this.selectCoveredCard();
  }

  findHighestCard(): CardData {
    let found = null;
    for (const row of this.gameGrid) {
      for (const card of row) {
        if (card != null && !card.isCovered && card.value > (found?.value || -3)) {
          found = card;
        }
      }
    }
    return found;
  }

  selectCoveredCard(): CardData {
    let x, y;
    do {
      y = Math.floor(Math.random() * this.gameGrid.length);
      x = Math.floor(Math.random() * this.gameGrid[0].length);
    } while (!this.gameGrid[y][x].isCovered);
    return this.gameGrid[y][x];
  }
}
