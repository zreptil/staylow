import {CardData} from '@/_models/card-data';
import {Utils} from '@/core/classes/utils';

export class PlayerData {
  public gameGrid: CardData[][];
  public score: number;

  constructor(public name: string) {
    this.gameGrid = [];
    for (let y = 0; y < 3; y++) {
      const row = [];
      for (let x = 0; x < 4; x++) {
        row.push(new CardData(0, true, {type: 'player', param: this}));
      }

      this.gameGrid.push(row);
    }
    this.score = 0;
  }

  execute(func: string): void {
  }

  get isDone(): boolean {
    for (const row of this.gameGrid) {
      for (const card of row) {
        if (card != null && card.covered) {
          return false;
        }
      }
    }
    return true;
  }

  get visibleValue(): number {
    const grid = this.gameGrid;
    let ret = 0;
    if (grid != null) {
      for (const row of grid) {
        for (const card of row) {
          if (card != null && !card.covered) {
            ret += card.value;
          }
        }
      }
    }
    return ret;
  }

  finishGame(): void {
    for (const row of this.gameGrid) {
      for (const card of row) {
        if (card != null) {
          card.covered = false;
        }
      }
    }
  }

  checkTriple(): CardData[] {
    const ret = [];
    for (let x = 0; x < this.gameGrid[0].length; x++) {
      let y = 1;
      if (this.gameGrid[0][x] != null) {
        const v = this.gameGrid[0][x].value;
        while (y < this.gameGrid.length
        && !this.gameGrid[y][x].covered
        && this.gameGrid[y][x].value === v) {
          y++;
        }
        if (y === this.gameGrid.length) {
          for (let y = 0; y < this.gameGrid.length; y++) {
            ret.push(this.gameGrid[y][x]);
            this.gameGrid[y][x] = null;
          }
        }
      }
    }
    return ret;
  }

  replaceCard(oldCard: CardData, newCard: CardData): CardData {
    for (const row of this.gameGrid) {
      let idx = 0;
      for (const card of row) {
        if (card?.cardId === oldCard.cardId) {
          newCard.scope.type = 'player';
          row[idx] = newCard;
          return card;
        }
        idx++;
      }
    }
    return null;
  }

  toString(): string {
    let ret = [];
    for (const row of this.gameGrid) {
      ret.push(Utils.cardsToJson(row));
    }

    ret.push(`${this.name}`);
    return Utils.join(ret, '');
  }
}
