import {CardData} from '@/_models/card-data';
import {Utils} from '@/core/classes/utils';

export class PlayerData {
  public gameGrid: CardData[][];
  public score: number;
  public board = 1;
  public avatar = null;
  public setupDone = false;
  public name: string;
  public brain: any;

  constructor({name = 'Spieler', brain = null, board = 1, avatar = null}) {
    this.name = name;
    this.brain = brain;
    this.board = board;
    this.avatar = avatar;
    this.reset();
    this.score = 0;
    if (brain != null) {
      brain.player = this;
    }
  }

  get isDone(): boolean {
    let ret = true;
    for (const row of this.gameGrid) {
      for (const card of row) {
        if (card != null && card.coveredState) {
          ret = false;
        }
      }
    }
    return ret;
  }

  get visibleValue(): number {
    const grid = this.gameGrid;
    let ret = 0;
    if (grid != null) {
      for (const row of grid) {
        for (const card of row) {
          if (card != null && !card.isCovered) {
            ret += card.value;
          }
        }
      }
    }
    return ret;
  }

  get overallValue(): number {
    const grid = this.gameGrid;
    let ret = 0;
    if (grid != null) {
      for (const row of grid) {
        for (const card of row) {
          if (card != null) {
            ret += card.value;
          }
        }
      }
    }
    return ret;
  }

  get asJson(): any {
    const ret = {name: this.name, board: this.board, avatar: this.avatar, grid: []};
    for (const row of this.gameGrid) {
      ret.grid.push(Utils.cardsToJson(row));
    }
    return ret;
  }

  reset(): void {
    this.setupDone = false;
    this.gameGrid = [];
    for (let y = 0; y < 3; y++) {
      const row = [];
      for (let x = 0; x < 4; x++) {
        row.push(null);
      }
      this.gameGrid.push(row);
    }
  }

  think(func: string): CardData {
    let cmd = `think_${func}`;
    let ret = null;
    if (this.brain?.[cmd]) {
      ret = this.brain[cmd]();
      if (ret != null) {
        console.log(this.name, cmd, ret.forLog);
      }
    }
    return ret;
  }

  finishGame(): void {
    for (const row of this.gameGrid) {
      for (const card of row) {
        if (card != null) {
          card._covered = false; // uncover();
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
        && !this.gameGrid[y][x].isCovered
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
}
