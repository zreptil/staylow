import {SessionService} from '@/_services/session.service';
import {PlayerData} from '@/_models/player-data';
import {CardData} from '@/_models/card-data';

export abstract class OpponentBase extends PlayerData {
  constructor(public ss: SessionService,
              name: string) {
    super(name);
  }

  execute(func: string): void {
    let cmd = `exec_${func}`;
    if (this[cmd]) {
      const card = this[cmd]();
      if (card != null) {
        cmd = `click_${func}`;
        this.ss[cmd](card);
      }
    }
  }

  exec_setup1(): CardData {
    return this.exec_uncoverCard();
  }

  exec_setup2(): CardData {
    return this.exec_uncoverCard();
  }

  exec_drawFromPile(): CardData {
    const card = this.ss.openPile[this.ss.openPile.length - 1];
    if (card.value < 5) {
      return card;
    }
    return this.ss.drawPile[0];
  }

  exec_placeCard(): CardData {
    const card = this.findHighestCard();
    if (card != null && card.value > 4) {
      return card;
    }
    if (this.ss.currentCard.scope.type === 'openpile') {
      return this.exec_uncoverCard();
    } else {
      return this.ss.openPile[this.ss.openPile.length - 1];
    }
    return null;
  }

  findHighestCard(): CardData {
    let found = null;
    for (const row of this.gameGrid) {
      for (const card of row) {
        if (!card.covered && card.value > found?.value) {
          found = card;
        }
      }
    }
    return found;
  }

  exec_uncoverCard(): CardData {
    let x, y;
    do {
      y = Math.floor(Math.random() * this.gameGrid.length);
      x = Math.floor(Math.random() * this.gameGrid[0].length);
    } while (!this.gameGrid[y][x].covered);
    return this.gameGrid[y][x];
  }

  /*      setup1: $localize`Eine Karte aufdecken`,
        setup2: $localize`Noch eine Karte aufdecken`,
        waitafter_setup2: $localize`@nextplayer@ ist dran`,
        drawFromPile: $localize`Eine Karte von einem der Stapel ziehen`,
        waitafter_drawFromPile: $localize`@nextplayer@ ist dran`,
        placeCard: this.currentCard?.scope.type === 'openpile'
          ? $localize`Eigene Karte ersetzen`
          : $localize`Eigene Karte ersetzen oder auf dem offenen Stapel ablegen`,
        uncoverCard: $localize`Eine verdeckte Karte aufdecken`,
        waitafter_uncoverCard: $localize`@nextplayer@ ist dran`,
        endOfGame: $localize`Ende des Spiels`,
        waitafter_endOfGame: $localize`Nächste Runde spielen`,
  */
}
