import {Injectable} from '@angular/core';
import {CardData} from '@/_models/card-data';
import {EnvironmentService} from '@/_services/environment.service';
import {PlayerData} from '@/_models/player-data';
import {Utils} from '@/core/classes/utils';
import {Opponent} from '@/core/classes/opponent';
import {log} from '@/_services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  public players: PlayerData[];
  public drawPile: CardData[];
  public openPile: CardData[];
  public currentPlayerIdx = 0;
  public finalizerIdx = -1;
  public finalizerWasLowest = true;
  public gameIsOver = false;
  public currentCard: CardData;
  public isAnimating = false;

  constructor(public env: EnvironmentService) {
    this.mode = 'setup1';
    this.currentPlayerIdx = 0;
    this.players = [];
    this.players.push(new PlayerData(`Spieler 1`));
    this.players.push(new Opponent(this, 'Susi Sorglos'));
//    this.players.push(new Opponent(this, 'Hurwanek Krustinak'));
//    this.players.push(new Opponent(this, 'Peter Lustig'));

    this.initGame();
  }

  private _mode: string = '';

  public get mode(): string {
    return this._mode;
  }

  public set mode(value: string) {
    this._mode = value;
    this.players?.[this.currentPlayerIdx]?.execute(this._mode);
    if (this.mode !== 'waitafter_endOfGame' && this.mode.startsWith('waitafter_')) {
      setTimeout(() => this.onWaitAfterClick(), 1);
    }
  }

  get inactivePlayers(): number[] {
    const ret = [];
    let idx = this.currentPlayerIdx;
    while (ret.length < this.players.length - 1) {
      idx++;
      if (idx >= this.players.length) {
        idx = 0;
      }
      ret.push(idx);
    }
    return ret;
  }

  get gameInfo(): string {
    const infos = {
      setup1: $localize`Eine Karte aufdecken`,
      setup2: $localize`Noch eine Karte aufdecken`,
      waitafter_setup2: $localize`@nextplayer@ ist dran`,
      drawFromPile: $localize`Eine Karte von einem der Stapel ziehen`,
      waitafter_round: $localize`@player@ ist dran`,
      placeCard: this.currentCard?.scope.type === 'openpile'
        ? $localize`Eigene Karte ersetzen`
        : $localize`Eigene Karte ersetzen oder auf dem offenen Stapel ablegen`,
      uncoverCard: $localize`Eine verdeckte Karte aufdecken`,
      waitafter_uncoverCard: $localize`@player@ ist dran`,
      endOfGame: $localize`Ende des Spiels`,
      waitafter_endOfGame: $localize`Nächste Runde spielen`,
    };
    if (infos[this.mode] != null) {
      let ret = infos[this.mode];
      if (this.mode === 'waitafter_endOfGame') {
        ret = this.endOfGameMessage;
        log.info('endOfGameMessage', ret);
      }
      ret = ret.replace(/@player@/g, this.players[this.currentPlayerIdx]?.name);
      ret = ret.replace(/@nextplayer@/g, this.players[this.getNextPlayer()]?.name);
      const p = this.players[this.currentPlayerIdx + 1];
      if (!this.env.production) {
        ret += ` - ${this.mode}`;
      }
      return ret;
    }
    return $localize`Keine Ahnung, was läuft - ${this.mode}`;
  }

  get endOfGameMessage(): string {
    const ret = [];
    ret.push(this.players[this.finalizerIdx].name);
    ret.push($localize` hat das Spiel beendet`);
    if (!this.finalizerWasLowest) {
      ret.push($localize`. Für die Frechheit, das zu tun und nicht die wenigsten Punkte zu haben, wurden diese verdoppelt.`);
    } else {
      ret.push($localize` und die Runde gewonnen.`);
    }

    // Prüfen, ob das Spiel vorbei ist oder noch eine Runde gespielt werden muss.
    let minScore = 100000000;
    this.gameIsOver = false;
    for (const p of this.players) {
      if (p.score >= 100) {
        this.gameIsOver = true;
      }
      if (p.score < minScore) {
        minScore = p.score;
      }
    }

    if (this.gameIsOver) {
      const winners = this.players.filter(p => p.score === minScore).map(entry => entry.name);
      ret.push($localize`Das Spiel ist vorüber und gewonnen hat: `);
      ret.push(Utils.join(winners, ', '));
    }

    return Utils.join(ret, '');
  }

  getClassForCard(card: CardData): string {
    const ret = ['card'];

    if (!card.coveredState) {
      ret.push(`c${card.colorIdx} v${card.value}`);
      ret.push(`v${card.value}`);
    }

    if (card.cardId === this.currentCard?.cardId) {
      ret.push('active');
    }

    return Utils.join(ret, ' ');
  }

  shuffle(): void {
    for (let i = 0; i < 5000; i++) {
      const r1 = Math.floor(Math.random() * this.drawPile.length);
      const r2 = Math.floor(Math.random() * this.drawPile.length);
      const temp = this.drawPile[r1];
      this.drawPile[r1] = this.drawPile[r2];
      this.drawPile[r2] = temp;
    }
  }

  initGame(): void {
    if (this.gameIsOver) {
      for (const p of this.players) {
        p.score = 0;
      }
    }
    this.gameIsOver = false;
    this.drawPile = [];
    for (let i = 0; i < 150; i++) {
      this.drawPile.push(new CardData(i, true, {type: 'drawpile'}));
    }
    this.openPile = [];
    this.shuffle();
    this.initPlayers();
    if (this.finalizerIdx >= 0) {
      this.currentPlayerIdx = this.finalizerIdx;
      this.finalizerIdx = -1;
    } else {
      this.currentPlayerIdx = 0;
    }
    this.mode = 'setup1';
  }

  initPlayers(): void {
    this.players.forEach((p, idx) => {
      p.setupDone = false;
      for (let i = 0; i < 12; i++) {
        const card = this.getFromDrawPile();
        card.scope.type = 'player';
        card.scope.param = idx;
        p.gameGrid[Math.floor(i / 4)][i % 4] = card;
      }
    });
    const card = this.getFromDrawPile();
    card.uncover();
    card.scope.type = 'openpile';
    this.openPile.splice(0, 0, card);
  }

  getFromDrawPile(): CardData {
    const ret = this.getFromPile(this.drawPile);
    if (this.drawPile.length === 0) {
      const openCard = this.openPile.splice(this.openPile.length - 1, 1)[0];
      for (const card of this.openPile) {
        card.scope.type = 'drawpile';
        card.cover();
        this.drawPile.push(card);
      }
      this.openPile = [openCard];
      this.shuffle();
    }
    return ret;
  }

  getFromPile(cardPile: CardData[]): CardData {
    return cardPile.splice(0, 1)[0];
  }

  onCardClick(card: CardData): void {
    if (this[`click_${this.mode}`]) {
      this[`click_${this.mode}`](card);
    }
  }

  onWaitAfterClick(): void {
    const cmd = `after_${this.mode.substring(10)}`;
    if (this[cmd]) {
      this[cmd]();
    }
  }

  click_setup1(card: CardData): void {
    if (card.scope.type === 'player'
      && this.currentPlayerIdx === card.scope.param
      && card.isCovered
    ) {
      card.uncover();
      this.mode = 'setup2';
    }
  }

  click_setup2(card: CardData): void {
    if (card.scope.type === 'player'
      && this.currentPlayerIdx === card.scope.param
      && card.isCovered
    ) {
      card.uncover();
      this.mode = 'waitafter_setup2';
    }
  }

  after_setup2(): void {
    this.players[this.currentPlayerIdx].setupDone = true;
    this.nextPlayer();
    // if (this.players[this.currentPlayerIdx].setupDone) {
    //   this.mode = 'drawFromPile';
    // } else {
    //   this.mode = 'setup1';
    // }
    // if (this.currentPlayerIdx < this.players.length) {
    //   this.mode = 'setup1';
    // } else {
    //   this.currentPlayerIdx = 0;
    //   this.mode = 'drawFromPile';
    // }
  }

  click_drawFromPile(card: CardData): void {
    if (card.scope.type === 'drawpile') {
      this.drawPile[0].uncover();
      this.currentCard = this.drawPile[0];
      this.mode = 'placeCard';
    } else if (card.scope.type === 'openpile') {
      this.currentCard = this.openPile[0];
      this.mode = 'placeCard';
    }
  }

  click_placeCard(card: CardData): void {
    if (card.scope.type === 'player' && card.scope.param === this.currentPlayerIdx) {
      const pile = this.currentCard.scope.type;
      this.currentCard.scope.param = this.currentPlayerIdx;
      card = this.players[this.currentPlayerIdx].replaceCard(card, this.currentCard);
      if (card != null) {
        if (pile === 'drawpile') {
          this.getFromDrawPile();
        } else {
          this.getFromPile(this.openPile);
        }
        card.scope.type = 'openpile';
        card.uncover();
        this.openPile.splice(0, 0, card);
        this.currentCard = null;
        this.mode = 'waitafter_round';
      }
    } else if (card === this.currentCard && card.scope.type === 'openpile') {
      this.currentCard = null;
      this.mode = 'drawFromPile';
    } else if (card.scope.type === 'openpile') {
      this.currentCard = this.getFromDrawPile();
      this.currentCard.scope.type = 'openpile';
      this.openPile.splice(0, 0, this.currentCard);
      this.currentCard = null;
      this.mode = 'uncoverCard';
    }
  }

  click_uncoverCard(card: CardData): void {
    if (card.scope.type === 'player'
      && card.scope.param === this.currentPlayerIdx
      && card.isCovered) {
      card.uncover();
      this.mode = 'waitafter_uncoverCard';
    }
  }

  after_round(): void {
    this.nextPlayer();
  }

  after_uncoverCard(): void {
    console.error('na, nu aber!!!', this.players[this.currentPlayerIdx].name);
    this.nextPlayer();
  }

  getNextPlayer(): number {
    let ret = this.currentPlayerIdx + 1;
    if (ret >= this.players.length) {
      ret = 0;
    }
    return ret;
  }

  nextPlayer(): void {
    this.currentCard = null;
    const cards = this.players[this.currentPlayerIdx].checkTriple();
    if (cards.length > 0) {
      for (const card of cards) {
        card.scope.type = 'openpile';
        this.openPile.splice(0, 0, card);
      }
    }
    this.currentPlayerIdx = this.getNextPlayer();
    if (this.players[this.currentPlayerIdx].isDone) {
      if (this.finalizerIdx < 0) {
        this.finalizerIdx = this.currentPlayerIdx;
      }
      const check = this.players[this.finalizerIdx].overallValue;
      this.finalizerWasLowest = true;
      this.players.forEach((p, idx) => {
        p.finishGame();
        if (idx !== this.finalizerIdx && p.overallValue <= check) {
          this.finalizerWasLowest = false;
        }
      });

      this.players.forEach((p, idx) => {
        p.score += p.overallValue;
        if (idx === this.finalizerIdx && !this.finalizerWasLowest) {
          p.score += p.overallValue;
        }
      });
      this.mode = 'waitafter_endOfGame';
    }
  }

  startRound(): void {
    if (this.mode !== 'waitafter_endOfGame') {
      if (this.players[this.currentPlayerIdx].setupDone) {
        this.mode = 'drawFromPile';
      } else {
        this.mode = 'setup1';
      }
    }
  }

  after_endOfGame(): void {
    this.initGame();
  }
}
