import {PlayerData} from '@/_models/player-data';

/**
 * Klasse für die Scoredaten einer Spielerpaarung.
 */
export class ScoreData {
  games: {
    rounds: { [key: string]: number } [][],
  } = {rounds: []};
  winners: { [key: string]: number } = {};
  private _rounds: { [key: string]: number } [];

  constructor(src?: any) {
    this._rounds = [];
    this.games = src?.games || {rounds: []};
    this.winners = src?.winners || {};
  }

  addRound(players: PlayerData[]): void {
    const min = Math.min(...players.map(entry => entry.overallValue));
    const round = {};
    for (const player of players) {
      // Wenn die Runde mit doppelten Punkten beendet wurde, wird
      // 1000 zur Punktzahl addiert
      if (player.roundDouble) {
        round[player.name] = player.overallValue + 1000;
      } else {
        round[player.name] = player.overallValue;
      }
    }
    this._rounds.push(round);
  }

  addGame(players: PlayerData[]): void {
    const min = Math.min(...players.map(entry => entry.score));
    for (const player of players) {
      if (this.winners[player.name] == null) {
        this.winners[player.name] = 0;
      }
      if (player.score === min) {
        this.winners[player.name]++;
      }
    }
    this.games.rounds.push(this._rounds);
    this._rounds = [];
  }
}

