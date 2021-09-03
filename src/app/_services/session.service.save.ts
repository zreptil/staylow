/*
import {Injectable} from '@angular/core';
import {CardData} from '@/_models/card-data';
import {EnvironmentService} from '@/_services/environment.service';
import {PlayerData} from '@/_models/player-data';
import {Utils} from '@/core/classes/utils';
import {Brain01} from '@/core/classes/brain01';
import {Brain02} from '@/core/classes/brain02';
import {Brain03} from '@/core/classes/brain03';
import {ScoreData} from '@/_models/score-data';

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
  gameIsOver = false;
  gameEnders = [];
  public appMode = 'config';
  public version = '0.5.0';
  public cfg = {
    lastVersion: '',
    waitAfterMove: false,
    waitAfterRound: true,
    waitAfterGame: true,
    currentPlayerLeft: true,
    showMoveAnimation: false,
    showFlipAnimation: false
  };
  public scores: { [key: string]: ScoreData } = {};
  public avatarList = {count: 12, mask: 'assets/avatars/av@idx@.png'};
  public boardList = {count: 10, mask: 'assets/boards/board@idx@.png'};
  public opponentDefs = [
    {name: 'Susi Sorglos', avatar: 6, board: 3, brain: Brain01.factory},
    {name: 'Siggi Sonnenschein', avatar: 10, board: 3, brain: Brain01.factory},
    {name: 'Gerda Greencard', avatar: 8, board: 4, brain: Brain02.factory},
    {name: 'Günter Grünspan', avatar: 9, board: 4, brain: Brain02.factory},
    {name: 'Lilly Lustig', avatar: 11, board: 5, brain: Brain03.factory},
    {name: 'Leo Löwenzahn', avatar: 12, board: 5, brain: Brain03.factory}
  ];
  private;
  public modeData = null;
  public infos = {
    setup1: $localize`Eine Karte aufdecken`,
    setup2: $localize`Noch eine Karte aufdecken`,
    selectPile: $localize`Eine Karte von einem der Stapel ziehen`,
    placeCard: this.currentCard?.scope.type === 'openpile'
      ? $localize`Eigene Karte ersetzen`
      : $localize`Eigene Karte ersetzen oder auf dem offenen Stapel ablegen`,
    uncoverCard: $localize`Eine verdeckte Karte aufdecken`,
    waitafter_move: $localize`@nextplayer@ ist dran`,
    waitafter_round: $localize`@nextplayer@ ist dran`,
    waitafter_endOfGame: $localize`Neues Spiel`,
    endOfGame: $localize`Ende des Spiels`,
  };
  private nextPlayerIdx = 0;
  private clickMode = '';

  constructor(public env: EnvironmentService) {
    this._mode = 'setup1';
    this.currentPlayerIdx = 0;
    this.players = [];
    this.loadConfig();
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
    // console.error('set currentCard', value?.forLog);
    this._currentCard = value;
  }

  private _mode: string = '';

  public get mode(): string {
    return this._mode;
  }

  public set mode(value: string) {
    this._mode = value;
    this.clickMode = value;
    console.error('mode', this._mode);
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
        } else if (this.mode.startsWith('waitafter_')) {
          this.executeClick();
        }
      } else {
        if (this[cmd]) {
          this[cmd]();
        }
        // else if (this.mode.startsWith('waitafter_')) {
        //   this.executeClick();
        // }
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
    if (this.infos[this.mode] != null) {
      let ret = this.infos[this.mode];
      if (this.mode === 'waitafter_endOfGame') {
        ret = this.endOfGameMessage;
      }
      ret = ret.replace(/@player@/g, this.players[this.currentPlayerIdx]?.name);
      ret = ret.replace(/@nextplayer@/g, this.players[this.nextPlayerIdx]?.name);
      return ret;
    }
    return this.env.production ? '' : this.mode;
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

    if (this.gameIsOver) {
      const minScore = Math.min(...this.players.map(entry => entry.score));
      const winners = this.players.filter(p => p.score === minScore).map(entry => entry.name);
      ret.push($localize` Das Spiel ist vorüber, weil folgende Spieler über 100 Punkte haben: `);
      ret.push(`${Utils.join(this.gameEnders, ', ')}.`);
      ret.push(` <b>Gewonnen hat: ${Utils.join(winners, ', ')}</b>`);
    }

    return Utils.join(ret, '');
  }

  get waitLabel(): string {
    switch (this.mode) {
      case 'waitafter_move':
        return 'Weiter';
      case 'waitafter_round':
        return 'Nächste Runde';
      case 'waitafter_endOfGame':
        return 'Neues Spiel';
    }
    return '';
  }

  private get statusInfo(): any {
    return {
      cp: this.players[this.currentPlayerIdx]?.forLog,
      np: this.players[this.nextPlayerIdx]?.forLog,
      cc: this.currentCard?.forLog
    };
  }

  getScoreKey(): string {
    let list = [];
    this.players.forEach(entry => list.push(entry));
    list = list.sort((a, b) => {
      const an = a.name.toLowerCase();
      const bn = b.name.toLowerCase();
      if (an < bn) {
        return -1;
      }
      if (an > bn) {
        return 1;
      }
      return 0;
    }).map(entry => entry.name);
    return Utils.join(list, '-');
  }

  waitForClick(): boolean {
    switch (this.mode) {
      case 'waitafter_move':
        return this.cfg.waitAfterMove;
      case 'waitafter_round':
        return this.cfg.waitAfterRound;
      case 'waitafter_endOfGame':
        return this.cfg.waitAfterGame;
    }
    return false;
  }

  executeClick(): void {
    if (!this.waitForClick()) {
      setTimeout(() => this.onWaitAfterClick(), 10);
    }
  }

  loadConfig(): void {
    let cfg = JSON.parse(localStorage.getItem('config'));
    if (cfg == null) {
      cfg = {
        cfg: this.cfg,
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
    this.cfg = cfg.cfg || this.cfg;

    this.players = players;
    const scores = JSON.parse(localStorage.getItem('scores'));
    this.scores = {};
    if (scores != null) {
      Object.keys(scores).forEach(key => {
        this.scores[key] = new ScoreData(scores[key]);
      });
    }
  }

  saveConfig(): void {
    const cfg = {cfg: this.cfg, players: []};
    for (const p of this.players) {
      cfg.players.push(p.asJson);
    }
    localStorage.setItem('config', JSON.stringify(cfg));
    const scores = {};
    Object.keys(this.scores).forEach(key => {
      if (this.env.production) {
        scores[key] = {games: this.scores[key].games};
      } else {
        scores[key] = this.scores[key];
      }
    });
    localStorage.setItem('scores', JSON.stringify(scores));
  }

  createPlayer({name = 'Spieler', opponentIdx = -1, board = 1, avatar = null}): PlayerData {
    let brain = null;
    if (opponentIdx >= 0) {
      if (opponentIdx >= this.opponentDefs.length) {
        opponentIdx = this.opponentDefs.length - 1;
      }
      const opp = this.opponentDefs[opponentIdx];
      brain = opp.brain(this);
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

  hideCard(card: CardData, mode: string, data?: any): void {
    if (this.cfg.showMoveAnimation && card.visible) {
      card.dataAfterAnimation = data;
      card.modeAfterAnimation = mode;
      card.hide();
    } else {
      card.visible = false;
      this.modeData = data;
      setTimeout(() => this.mode = mode, 10);
    }
  }

  showCard(card: CardData, mode: string, data?: any): void {
    card.dataAfterAnimation = data;
    if (this.cfg.showMoveAnimation && !card.visible) {
      card.modeAfterAnimation = mode;
      card.show();
    } else {
      card.visible = true;
      this.modeData = data;
      setTimeout(() => this.mode = mode, 10);
    }
  }

  uncoverCard(card: CardData, mode: string, data?: any): void {
    if (this.cfg.showFlipAnimation && card._covered) {
      card.dataAfterAnimation = data;
      card.modeAfterAnimation = mode;
      card.uncover();
    } else {
      card._covered = false;
      this.modeData = data;
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
    this.clickMode = '';
    this._mode = '';
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
        setTimeout(() => this.mode = 'waitafter_move', 10);
      }
      return;
    }
    // Wenn noch nicht alle Spieler dran waren, dann ist der nächste dran.
    this.nextPlayerIdx = this.getNextPlayer();
    setTimeout(() => this.mode = 'waitafter_move', 10);
  }

  after_move(): void {
    this.startRound();
  }

  after_round(): void {
    this.startRound();
  }

  after_endOfGame(): void {
    this.initGame();
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

  on_draw2playerStep1(): void {
    const data = this.players[this.currentPlayerIdx].replaceCard(this.modeData, null);
    if (data != null) {
      data.card.visible = false;
      data.card.scope.type = 'openpile';
      this.openPile.splice(0, 0, data.card);
      data.card._covered = false;
      this.showCard(data.card, 'draw2playerStep2', data);
    }
  }

  on_draw2playerStep2(): void {
    this.hideCard(this.currentCard, 'draw2playerStep3', this.modeData);
  }

  on_draw2playerStep3(): void {
    this.currentCard.scope.type = 'player';
    this.currentCard.scope.param = this.currentPlayerIdx;
    this.currentCard.visible = false;
    this.players[this.currentPlayerIdx].gameGrid[this.modeData.y][this.modeData.x] = this.currentCard;
    this.getFromDrawPile();
    this.showCard(this.currentCard, 'waitafter_move');
  }

  on_open2playerStep1(): void {
    this.hideCard(this.openPile[0], 'open2playerStep2', this.modeData);
  }

  on_open2playerStep2(): void {
    const card = this.getFromPile(this.openPile);
    const data = this.players[this.currentPlayerIdx].replaceCard(this.modeData, card);
    data.card.scope.type = 'openpile';
    this.openPile.splice(0, 0, data.card);
    data.card._covered = false;
    this.showCard(data.card, 'open2playerStep3', card);
  }

  on_open2playerStep3(): void {
    this.showCard(this.modeData, 'waitafter_move');
  }

  on_draw2openStep1(): void {
    const card = this.getFromDrawPile();
    card.scope.type = 'openpile';
    this.openPile.splice(0, 0, card);
    this.showCard(card, 'uncoverCard');
  }

  click_placeCard(card: CardData): boolean {
    if (card.scope.type === 'player' && card.scope.param === this.currentPlayerIdx) {
      // angeklickte Karte gehört dem Spieler
      const pile = this.currentCard.scope.type;
      this.currentCard.scope.param = this.currentPlayerIdx;
      if (pile === 'drawpile') {
        this.hideCard(card, 'draw2playerStep1', card);
      } else {
        this.hideCard(card, 'open2playerStep1', card);
      }
      return true;
    } else if (card.cardId === this.currentCard?.cardId && card.scope.type === 'openpile') {
      // angeklickte Karte ist die selektierte Karte und auf dem offenen Stapel => Auswahl rückgängig machen
      this.currentCard = null;
      setTimeout(() => this.mode = 'selectPile', 10);
    } else if (card.scope.type === 'openpile') {
      // Der offene Stapel wurde angeklickt
      this.hideCard(this.currentCard, 'draw2openStep1');
      return true;
      // this.currentCard = this.getFromDrawPile();
      // this.currentCard.scope.type = 'openpile';
      // this.openPile.splice(0, 0, this.currentCard);
      // setTimeout(() => this.mode = 'uncoverCard', 10);
    }
    return false;
  }

  click_uncoverCard(card: CardData): boolean {
    if (card.scope.type === 'player'
      && card.scope.param === this.currentPlayerIdx
      && card.isCovered) {
      this.uncoverCard(card, 'waitafter_move');
      return true;
    }
    return false;
  }

  getNextPlayer(): number {
    let ret = this.currentPlayerIdx + 1;
    if (ret >= this.players.length) {
      ret = 0;
    }
    return ret;
  }

  on_tripleStep1(): void {
    this.currentCard = this.modeData.splice(0, 1)[0];
    this.players[this.currentPlayerIdx].replaceCard(this.currentCard, null);
    this.currentCard.scope.type = 'openpile';
    this.openPile.splice(0, 0, this.currentCard);
    if (this.modeData.length > 0) {
      this.showCard(this.currentCard, 'tripleStep2', this.modeData);
    } else {
      this.showCard(this.currentCard, 'waitafter_round');
    }
  }

  on_tripleStep2(): void {
    this.hideCard(this.modeData[0], 'tripleStep1', this.modeData);
  }

  on_checkFinalizer(): void {
    // Wenn der nächste Spieler, der dran ist fertig ist,
    // ist das Spiel beendet. Hier muss dann die Auswertung
    // des Spiels erfolgen.
    console.log('Checke final');
    if (this.players[this.nextPlayerIdx].isDone) {
      console.log('SCHICHT IM SCHACHT!!!!');
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
        p.roundDouble = false;
        if (idx === this.finalizerIdx && !this.finalizerWasLowest) {
          p.score += p.overallValue;
          p.roundDouble = true;
        }
      });
      // Prüfen, ob das Spiel vorbei ist oder noch eine Runde gespielt werden muss.
      this.gameIsOver = false;
      this.gameEnders = [];
      for (const p of this.players) {
        if (p.score >= 100) {
          this.gameIsOver = true;
          this.gameEnders.push(p.name);
        }
      }
      const key = this.getScoreKey();
      if (this.scores[key] == null) {
        this.scores[key] = new ScoreData();
      }
      this.scores[key].addRound(this.players);
      if (this.gameIsOver) {
        this.scores[key].addGame(this.players);
      }
      this.saveConfig();
      setTimeout(() => this.mode = 'waitafter_endOfGame', 10);
      return;
    }
    this.executeClick();
  }

  on_waitafter_round(): void {
    this.currentCard = null;
    const cards = this.players[this.currentPlayerIdx].checkTriple();
    if (cards.length > 0) {
      this.hideCard(cards[0], 'tripleStep1', cards);
      console.log('SCHISSS!!!!');
      return;
    }
    this.on_checkFinalizer();
  }

  on_setup1(): void {
    if (this.players[this.currentPlayerIdx].name === '@Dummy@') {
      this.players[this.currentPlayerIdx].setupDone = true;
      this.mode = 'waitafter_move';
    }
  }

  startPlayer(): void {
    const player = this.players[this.currentPlayerIdx];
    if (player.name === '@Dummy@') {
      player.gameGrid = [];
//      const cards = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140];
      const cards = [30, 40, 50, 60, 31, 41, 51, 61, 32, 42, 52, 62];
      let idx = 0;
      for (let y = 0; y < 3; y++) {
        const row = [];
        for (let x = 0; x < 4; x++) {
          row.push(new CardData(cards[idx], y == 2 && x == 3, {type: 'player', param: this.currentPlayerIdx}));
          idx++;
        }
        player.gameGrid.push(row);
      }
      this.openPile.splice(0, 0, new CardData(cards[0] + 3, false, {type: 'openpile'}));
    }
  }

  startRound(): void {
    this.currentPlayerIdx = this.nextPlayerIdx;
    this.nextPlayerIdx = this.getNextPlayer();
    this.startPlayer();
    if (this.mode !== 'waitafter_endOfGame') {
      if (this.players[this.currentPlayerIdx].setupDone) {
        setTimeout(() => this.mode = 'selectPile', 10);
      } else {
        setTimeout(() => this.mode = 'setup1', 10);
      }
    }
  }
}
*/
