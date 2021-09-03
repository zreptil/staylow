import {Component, OnInit} from '@angular/core';
import {SessionService} from '@/_services/session.service';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {

  public cfg: any;

  constructor(public ss: SessionService) {
  }

  ngOnInit(): void {
    this.cfg = this.ss.cfg;
  }

  changeFlipAnimation(): void {
    this.cfg.showFlipAnimation = !this.cfg.showFlipAnimation;
  }

  changeMoveAnimation(): void {
    this.cfg.showMoveAnimation = !this.cfg.showMoveAnimation;
  }

  changeWaitAfterPlayer(): void {
    this.cfg.waitAfterPlayer = !this.cfg.waitAfterPlayer;
    if (!this.cfg.waitAfterPlayer && this.ss.mode === 'waitafter_player') {
      this.ss.onWaitAfterClick();
    }
  }

  changeWaitAfterRound(): void {
    this.cfg.waitAfterRound = !this.cfg.waitAfterRound;
    if (!this.cfg.waitAfterRound && !this.ss.gameIsOver && this.ss.mode === 'waitafter_round') {
      this.ss.onWaitAfterClick();
    }
  }

  changeWaitAfterGame(): void {
    this.cfg.waitAfterGame = !this.cfg.waitAfterGame;
    if (!this.cfg.waitAfterGame && this.ss.gameIsOver && this.ss.mode === 'waitafter_round') {
      this.ss.onWaitAfterClick();
    }
  }

  changeCurrentPlayerLeft(): void {
    this.cfg.currentPlayerLeft = !this.cfg.currentPlayerLeft;
  }
}
