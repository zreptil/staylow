import {SessionService} from '@/_services/session.service';
import {CardData} from '@/_models/card-data';
import {Brain02} from '@/core/classes/brain02';

class ColumnData {
  constructor(public x: number, public y: number, public value: number) {
  }
}

export class Brain03 extends Brain02 {
  public level = 3;

  protected constructor(public ss: SessionService) {
    super(ss);
  }

  static factory(ss: SessionService): Brain03 {
    return new Brain03(ss);
  }

  create(ss: SessionService): Brain03 {
    return Brain03.factory(ss);
  }

  think_selectPile(): CardData {
    const card = this.ss.openPile[0];
    // Wenn die offene Karte eine bestehende Spalte
    // füllen würde, dann diese Karte nehmen
    if (this.checkTriple(card) != null) {
      return card;
    }
    return super.think_selectPile();
  }

  think_placeCard(): CardData {
    // Wenn eine Spalte gefüllt werden kann, dann das tun
    const card = this.checkTriple(this.ss.currentCard);
    if (card != null) {
      return card;
    }
    const check = this.ss.currentCard.value;
    if (check <= 0) {
      return super.think_placeCard();
    }
    // Spalte suchen, in der die aktuelle Zahl zu finden ist
    let list = [];
    for (let x = 0; x < this.player.gameGrid[0].length; x++) {
      if (this.player.value(x, 0) === check) {
        list.push(this.getSecondPlace(check, x, 1, 2));
      }
      if (this.player.value(x, 1) === check) {
        list.push(this.getSecondPlace(check, x, 0, 2));
      }
      if (this.player.value(x, 2) === check) {
        list.push(this.getSecondPlace(check, x, 0, 1));
      }
    }
    list = list.filter(entry => entry != null);
    let ret = null;
    for (const card of list) {
      if (card.value > (ret?.value || 0)) {
        ret = card;
      }
    }

    if (ret != null) {
      return ret;
    }

    return super.think_placeCard();
  }

  // Den Platz in der Spalte ermitteln, auf den die Karte gelegt werden kann
  getSecondPlace(check: number, x: number, y1: number, y2: number): CardData {
    const v1 = this.player.value(x, y1) || 0;
    const v2 = this.player.value(x, y2) || 0;
    if (v1 !== 0) {
      // Sonderfall, beide Werte sind gleich
      if (v1 === v2) {
        if (v1 > check) {
          return null;
        }
        return this.player.gameGrid[y1][x];
      }
      if (v1 > v2) {
        return this.player.gameGrid[y1][x];
      }
      return this.player.gameGrid[y2][x];
    }
    return v2 > check ? this.player.gameGrid[y2][x] : this.player.gameGrid[y1][x];
  }

  checkTriple(card: CardData): CardData {
    if (card.value <= 0) {
      return null;
    }
    const grid = this.player.gameGrid;
    for (let x = 0; x < grid[0].length; x++) {
      if (this.player.value(x, 0) === card.value && this.player.value(x, 0) === this.player.value(x, 1)) {
        return grid[2][x];
      }
      if (this.player.value(x, 1) === card.value && this.player.value(x, 1) === this.player.value(x, 2)) {
        return grid[0][x];
      }
      if (this.player.value(x, 0) === card.value && this.player.value(x, 0) === this.player.value(x, 2)) {
        return grid[1][x];
      }
    }
    return null;
  }
}
