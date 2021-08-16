import {Injectable} from '@angular/core';
import {CardData} from '@/_models/card-data';
import {log} from '@/_services/logger.service';
import {EnvironmentService} from '@/_services/environment.service';
import {PlayerData} from '@/_models/player-data';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  public players: PlayerData[];
  public hiddenStack: CardData[];
  public openStack: CardData[];
  private _gridRows = 3;
  private _gridColumns = 4;

  constructor(public env: EnvironmentService) {
    this.players = [];
    this.players.push(new PlayerData());
    this.players.push(new PlayerData());
    this.hiddenStack = [];
    for (let i = 0; i < 150; i++) {
      this.hiddenStack.push(new CardData(i, true));
    }
    this.openStack = [];
  }

  shuffle(): void {
    for (let i = 0; i < 5000; i++) {
      const r1 = Math.floor(Math.random() * this.hiddenStack.length);
      const r2 = Math.floor(Math.random() * this.hiddenStack.length);
      const temp = this.hiddenStack[r1];
      this.hiddenStack[r1] = this.hiddenStack[r2];
      this.hiddenStack[r2] = temp;
    }
    log.info(this.hiddenStack);
  }

  initPlayers(): void {
    for (const p of this.players) {
      for (let i = 0; i < 12; i++) {
        p.gameGrid[Math.floor(i / 4)][i % 4] = this.getFromStack(this.hiddenStack);
      }
    }
    const card = this.getFromStack(this.hiddenStack)
    card.covered = false;
    this.openStack.push(card);
  }

  getFromStack(cardStack: CardData[]): CardData {
    return cardStack.splice(0, 1)[0];
  }
}
