import {Injectable} from '@angular/core';
import {CardData} from '@/_models/card-data';
import {EnvironmentService} from '@/_services/environment.service';
import {PlayerData} from '@/_models/player-data';
import {Utils} from '@/core/classes/utils';
import {log} from '@/_services/logger.service';
import {Brain01} from '@/core/classes/brain01';
import {Brain02} from '@/core/classes/brain02';

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
  public appMode = 'config';
  public avatarList = {count: 10, mask: 'assets/avatars/av@idx@.png'};
  public boardList = {count: 10, mask: 'assets/boards/board@idx@.png'};
  public opponentDefs = [
    {name: 'Susi Sorglos', avatar: 6, board: 3, brain: new Brain01(this)},
    {name: 'Siegfried Sonnenschein', avatar: 10, board: 3, brain: new Brain01(this)},
    {name: 'Gerda Greencard', avatar: 8, board: 4, brain: new Brain02(this)},
    {name: 'Günter Grünspan', avatar: 9, board: 4, brain: new Brain02(this)}
  ];
  private nextPlayerIdx = 0;
  private clickMode = '';

  constructor(public env: EnvironmentService) {
    this._mode = 'setup1';
    this.currentPlayerIdx = 0;
    this.players = [];
    this.loadConfig();
    this.initGame();
  }

  public _editPlayer: PlayerData;

  get editPlayer(): PlayerData {
    if (this._editPlayer == null) {
      this._editPlayer = new PlayerData({name: `Spieler ${this.players.length + 1}`});
    }
    return this._editPlayer;
  }

  public _currentCard: CardData;

  public get currentCard(): CardData {
    return this._currentCard;
  }

  public set currentCard(value: CardData) {
    console.error('set currentCard', value?.forLog);
    this._currentCard = value;
  }

  private _mode: string = '';

  public get mode(): string {
    return this._mode;
  }

  public set mode(value: string) {
    this._mode = value;
    this.clickMode = value;
    console.error('mode =', this._mode, this.statusInfo);
    const player = this.players?.[this.currentPlayerIdx];
    if (player != null) {
      const cmd = `on_${this.mode}`;
      if (!player.isDone) {
        const card = player.think(this._mode);
        if (card != null) {
          this.onCardClick(card);
        }
        if (this[cmd]) {
          this[cmd]();
        } else if (this.mode === 'waitafter_round' || this.mode === 'waitafter_setup2') {
          setTimeout(() => this.onWaitAfterClick(), 10);
        }
      } else {
        if (this[cmd]) {
          this[cmd]();
        }
      }
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
      selectPile: $localize`Eine Karte von einem der Stapel ziehen`,
      placeCard: this.currentCard?.scope.type === 'openpile'
        ? $localize`Eigene Karte ersetzen`
        : $localize`Eigene Karte ersetzen oder auf dem offenen Stapel ablegen`,
      uncoverCard: $localize`Eine verdeckte Karte aufdecken`,
      waitafter_round: $localize`@nextplayer@ ist dran`,
      waitafter_endOfGame: $localize`Nächste Runde spielen`,
      endOfGame: $localize`Ende des Spiels`,
    };
    if (infos[this.mode] != null) {
      let ret = infos[this.mode];
      if (this.mode === 'waitafter_endOfGame') {
        ret = this.endOfGameMessage;
      }
      ret = ret.replace(/@player@/g, this.players[this.currentPlayerIdx]?.name);
      ret = ret.replace(/@nextplayer@/g, this.players[this.nextPlayerIdx]?.name);
      return ret;
    }
    return $localize`Keine Ahnung, was läuft - ${this.mode}`;
  }

  get endOfGameMessage(): string {
    const ret = [];
    if (this.finalizerIdx < 0) {
      return '';
    }
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
    const gameEnders = [];
    for (const p of this.players) {
      if (p.score >= 100) {
        this.gameIsOver = true;
        gameEnders.push(p.name);
      }
      if (p.score < minScore) {
        minScore = p.score;
      }
    }

    if (this.gameIsOver) {
      const winners = this.players.filter(p => p.score === minScore).map(entry => entry.name);
      ret.push($localize` Das Spiel ist vorüber, weil folgende Spieler über 100 Punkte haben: `);
      ret.push(`${Utils.join(gameEnders, ', ')}.`);
      ret.push(` <b>Gewonnen hat: ${Utils.join(winners, ', ')}</b>`);
    }

    return Utils.join(ret, '');
  }

  private get statusInfo(): any {
    return {
      cp: this.players[this.currentPlayerIdx]?.forLog,
      np: this.players[this.nextPlayerIdx]?.forLog,
      cc: this.currentCard?.forLog
    };
  }

  loadConfig(): void {
    let cfg = JSON.parse(localStorage.getItem('config'));
    if (cfg == null) {
      cfg = {
        players: [
          {name: 'Spieler 1', board: 2, avatar: 4, opponent: -1},
          {name: 'Spieler 2', board: 3, avatar: 5, opponent: -1}
        ]
      };
    }
    const players = [];
    for (const p of cfg.players) {
      p.opponentIdx = p.opponent;
      players.push(this.createPlayer(p));
    }

    // this.players.push(this.createPlayer({name: `Spieler 1`, board: 2, avatar: 4}));
    // this.players.push(this.createPlayer({name: `Spieler 2`, board: 3, avatar: 5}));

    this.players = players;

    console.log(this.players);
//     if (this.env.production) {
//       this.players.push(this.createPlayer({name: `Mutti`, board: 2, avatar: 4}));
//       this.players.push(this.createPlayer({opponentIdx: 0}));
//     } else {
// //      this.players.push(new PlayerData({opponentIdx: 1}));
//       this.players.push(this.createPlayer({opponentIdx: 0}));
//       this.players.push(this.createPlayer({name: `Spieler 1`, board: 2, avatar: 2}));
//     }
  }

  saveConfig(): void {
    const cfg = {players: []};
    for (const p of this.players) {
      cfg.players.push(p.asJson);
    }
    localStorage.setItem('config', JSON.stringify(cfg));
  }

  createPlayer({name = 'Spieler', opponentIdx = -1, board = 1, avatar = null}): PlayerData {
    let brain = null;
    if (opponentIdx >= 0) {
      if (opponentIdx >= this.opponentDefs.length) {
        opponentIdx = this.opponentDefs.length - 1;
      }
      const opp = this.opponentDefs[opponentIdx];
      brain = opp.brain;
      name = opp.name;
      board = opp.board;
      avatar = opp.avatar;
    }
    const ret = new PlayerData({
      name: name, brain: brain, opponentIdx: opponentIdx, board: board, avatar: avatar
    });
    return ret;
  }

  onWaitAfterClick(): void {
    const cmd = `after_${this.mode.substring(10)}`;
    if (this[cmd]) {
      this[cmd]();
    }
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

  uncoverCard(card: CardData, mode: string): void {
    log.info('uncoverCard', card.forLog, mode);
    if (card._covered) {
      card.modeAfterAnimation = mode;
      card.uncover();
    } else {
      setTimeout(() => this.mode = mode, 10);
    }
  }

  initGame(): void {
    if (this.gameIsOver) {
      for (const p of this.players) {
        p.score = 0;
      }
    }
    this.gameIsOver = false;
    const drawPile = [];
    for (let i = 0; i < 150; i++) {
      drawPile.push(new CardData(i, true, {type: 'drawpile'}));
    }
    this.drawPile = drawPile;
    this.shuffle();
    this.initPlayers();
    if (this.finalizerIdx >= 0) {
      this.currentPlayerIdx = this.finalizerIdx;
      this.finalizerIdx = -1;
    } else {
      this.currentPlayerIdx = 0;
    }
    const card = this.getFromDrawPile();
    card.scope.type = 'openpile';
    this.openPile = [card];
    this.uncoverCard(card, 'setup1');
  }

  initPlayers(): void {
    this.players.forEach((p, idx) => {
      p.reset();
      for (let i = 0; i < 12; i++) {
        const card = this.getFromDrawPile();
        card.scope.type = 'player';
        card.scope.param = idx;
        p.gameGrid[Math.floor(i / 4)][i % 4] = card;
      }
    });
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
    const cmd = `click_${this.clickMode}`;
    console.log(this.players[this.currentPlayerIdx].name, 'click', cmd);
    if (this[cmd]) {
      if (this[cmd](card)) {
        this.clickMode = '';
      }
    }
  }

  click_setup1(card: CardData): boolean {
    if (card.scope.type === 'player'
      && this.currentPlayerIdx === card.scope.param
      && card.isCovered
    ) {
      this.uncoverCard(card, 'setup2');
      return true;
    }
    return false;
  }

  click_setup2(card: CardData): boolean {
    if (card.scope.type === 'player'
      && this.currentPlayerIdx === card.scope.param
      && card.isCovered
    ) {
      this.uncoverCard(card, 'check_setup2');
      return true;
    }
    return false;
  }

  on_check_setup2(): void {
    this.players[this.currentPlayerIdx].setupDone = true;
    // Wenn alle Spieler dran waren, den ermitteln, der
    // anfangen darf.
    if (this.players.find(p => !p.setupDone) == null) {
      let startPlayer = this.currentPlayerIdx;
      this.players.forEach((p, idx) => {
        if (p.visibleValue > this.players[startPlayer].visibleValue) {
          startPlayer = idx;
        }
      });
      if (this.currentPlayerIdx === startPlayer) {
        setTimeout(() => this.mode = 'selectPile', 10);
      } else {
        this.nextPlayerIdx = startPlayer;
        setTimeout(() => this.mode = 'waitafter_setup2', 10);
      }
      return;
    }
    // Wenn noch nicht alle Spieler dran waren, dann ist der nächste dran.
    this.nextPlayerIdx = this.getNextPlayer();
    setTimeout(() => this.mode = 'waitafter_setup2', 10);
  }

  after_setup2(): void {
    this.startRound();
  }

  click_selectPile(card: CardData): boolean {
    if (card.scope.type === 'drawpile') {
      this.currentCard = this.drawPile[0];
      this.uncoverCard(this.currentCard, 'placeCard');
      return true;
    } else if (card.scope.type === 'openpile') {
      this.currentCard = this.openPile[0];
      setTimeout(() => this.mode = 'placeCard', 10);
      return false;
    }
    return false;
  }

  click_placeCard(card: CardData): boolean {
    if (card.scope.type === 'player' && card.scope.param === this.currentPlayerIdx) {
      // angeklickte Karte gehört dem Spieler
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
        this.openPile.splice(0, 0, card);
        this.uncoverCard(card, 'waitafter_round');
        return true;
      }
      return false;
    } else if (card.cardId === this.currentCard?.cardId && card.scope.type === 'openpile') {
      // angeklickte Karte ist die selektierte Karte
      this.currentCard = null;
      setTimeout(() => this.mode = 'selectPile', 10);
    } else if (card.scope.type === 'openpile') {
      // Der offene Stapel wurde angeklickt
      this.currentCard = this.getFromDrawPile();
      this.currentCard.scope.type = 'openpile';
      this.openPile.splice(0, 0, this.currentCard);
      setTimeout(() => this.mode = 'uncoverCard', 10);
    }
    return false;
  }

  click_uncoverCard(card: CardData): boolean {
    if (card.scope.type === 'player'
      && card.scope.param === this.currentPlayerIdx
      && card.isCovered) {
      this.uncoverCard(card, 'waitafter_round');
      return true;
    }
    return false;
  }

  after_round(): void {
    this.startRound();
  }

  getNextPlayer(): number {
    let ret = this.currentPlayerIdx + 1;
    if (ret >= this.players.length) {
      ret = 0;
    }
    return ret;
  }

  on_waitafter_round(): void {
    this.currentCard = null;
    const cards = this.players[this.currentPlayerIdx].checkTriple();
    if (cards.length > 0) {
      for (const card of cards) {
        card.scope.type = 'openpile';
        this.openPile.splice(0, 0, card);
      }
    }
    // Wenn der nächste Spieler, der dran ist fertig ist,
    // ist das Spiel beendet. Hier muss dann die Auswertung
    // des Spiels erfolgen.
    if (this.players[this.nextPlayerIdx].isDone) {
      if (this.finalizerIdx < 0) {
        this.finalizerIdx = this.nextPlayerIdx;
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
      setTimeout(() => this.mode = 'waitafter_endOfGame', 10);
      return;
    }
    setTimeout(() => this.onWaitAfterClick(), 10);
  }

  startRound(): void {
    this.currentPlayerIdx = this.nextPlayerIdx;
    this.nextPlayerIdx = this.getNextPlayer();
    if (this.mode !== 'waitafter_endOfGame') {
      if (this.players[this.currentPlayerIdx].setupDone) {
        setTimeout(() => this.mode = 'selectPile', 10);
      } else {
        setTimeout(() => this.mode = 'setup1', 10);
      }
    }
  }

  after_endOfGame(): void {
    this.initGame();
    this.mode = 'setup1';
  }
}
