import {CardData} from '@/_models/card-data';
import {Utils} from '@/core/classes/utils';

export class PlayerData {
  public gameGrid: CardData[][];
  public score: number;
  public roundDouble: boolean;
  public board = 1;
  public avatar = null;
  public setupDone = false;
  public name: string;
  private brain: any;

  constructor({name = 'Spieler', brain = null, opponentIdx = -1, board = 1, avatar = null}) {
    this.name = name;
    this.opponentIdx = opponentIdx;
    this.brain = brain;
    this.board = board;
    this.avatar = avatar;
    this.reset();
    this.score = 0;
    if (brain != null) {
      brain.player = this;
    }
  }

  private _opponentIdx: number;

  public get opponentIdx(): number {
    return this._opponentIdx;
  }

  public set opponentIdx(value: number) {
    this._opponentIdx = value;
    if (value == null || value < 0) {
      this.brain = null;
    }
  }

  public get level(): number {
    return this.brain?.level;
  }

  get clone(): PlayerData {
    return new PlayerData({
      name: this.name,
      brain: this.brain?.create(this.brain.ss),
      opponentIdx: this.opponentIdx,
      board: this.board,
      avatar: this.avatar
    });
  }

  get avatarPath(): string {
    return `assets/avatars/av${Utils.formatNumber(this.avatar, 2)}.png`;
  }

  get boardPath(): string {
    return `assets/boards/board${Utils.formatNumber(this.board, 2)}.png`;
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
    const ret = {name: this.name, board: this.board, avatar: this.avatar, opponent: this.opponentIdx, grid: undefined};
    // ret.grid = [];
    // for (const row of this.gameGrid) {
    //   ret.grid.push(Utils.cardsToJson(row));
    // }
    return ret;
  }

  get forLog(): string {
    const ret = [];
    ret.push(this.name);
    ret.push(this.isDone ? '+' : '-');
    return Utils.join(ret, ', ');
  }

  value(x: number, y: number): number {
    if (!this.gameGrid[y][x]?.isCovered) {
      return this.gameGrid[y][x]?.value;
    }
    return null;
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
      if (this.value(x, 0) != null) {
        const v = this.value(x, 0);
        while (y < this.gameGrid.length
        && this.value(x, y) === v) {
          y++;
        }
        if (y === this.gameGrid.length) {
          for (let y = 0; y < this.gameGrid.length; y++) {
            ret.push(this.gameGrid[y][x]);
//            this.gameGrid[y][x] = null;
          }
        }
      }
    }
    return ret;
  }

  replaceCard(oldCard: CardData, newCard: CardData): { card: CardData, x: number, y: number } {
    let ret = {card: null, x: -1, y: -1};
    this.gameGrid.forEach((row, y) => {
      let idx = 0;
      row.forEach((card, x) => {
        if (card?.cardId === oldCard.cardId) {
          if (newCard != null) {
            newCard.scope.type = 'player';
          }
          row[idx] = newCard;
          ret = {card, x, y};
        }
        idx++;
      });
    });
    return ret;
  }
}
