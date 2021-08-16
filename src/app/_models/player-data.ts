import {CardData} from '@/_models/card-data';

export class PlayerData {
  public gameGrid: CardData[][];

  constructor() {
    this.gameGrid = [];
    for (let y = 0; y < 3; y++) {
      const row = [];
      for (let x = 0; x < 4; x++) {
        row.push(new CardData(0, true));
      }
      this.gameGrid.push(row);
    }
  }
}
