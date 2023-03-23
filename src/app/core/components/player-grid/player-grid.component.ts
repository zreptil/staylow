import {Component, OnInit} from '@angular/core';
import {SessionService} from '@/_services/session.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {PlayerData} from '@/_models/player-data';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {Utils} from '@/core/classes/utils';
import {PlayerEditComponent} from '@/core/components/player-edit/player-edit.component';
import {SettingsDialogComponent} from '@/core/components/config-dialog/settings-dialog.component';
import {WhatsnewComponent} from '@/core/components/whatsnew/whatsnew.component';

@Component({
  selector: 'app-player-grid',
  templateUrl: './player-grid.component.html',
  styleUrls: ['./player-grid.component.scss'],
})
export class PlayerGridComponent implements OnInit {

  constructor(public bpo: BreakpointObserver,
              public ss: SessionService,
              public dialog: MatDialog) {
  }

  boardStyle(player: PlayerData): string {
    return `background-image:url("assets/boards/board${Utils.formatNumber(player.board, 2)}.png")`;
  }

  playerStyle(idx: number): string {
    let order = idx - this.ss.currentPlayerIdx;
    if (order < 0) {
      order += this.ss.players.length;
    }
    if (!this.ss.cfg.currentPlayerLeft) {
      order = 0;
    }
    return `order:${order}`;
  }

  isActive(idx: number): boolean {
    return idx === this.ss.currentPlayerIdx;
  }

  classForTable(idx: number): string[] {
    const ret = [];
    if (this.ss.currentPlayerIdx >= 0 && idx !== this.ss.currentPlayerIdx) {
      ret.push('inactive');
    }
    return ret;
  }

  clickInfo(player: PlayerData, idx: number): void {
    if (this.ss.appMode !== 'config') {
      return;
    }
    if (player == null) {
      player = this.ss.createPlayer({opponentIdx: 2});
      this.ss.players.push(player);
    }
    this.ss._editPlayer = player;
    const dialogRef = this.dialog.open(PlayerEditComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (result === 'remove') {
          this.ss.players.splice(idx, 1);
          this.ss.saveConfig();
        } else {
          this.ss.players[idx] = result;
          this.ss.saveConfig();
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.ss.version !== this.ss.cfg.lastVersion) {
      if (this.ss.env.production) {
        this.ss.cfg.lastVersion = this.ss.version;
      }
      this.clickWhatsnew();
    }
  }

  clickGame(): void {
    this.ss.initGame();
    this.ss.saveConfig();
    this.ss.appMode = 'game';
  }

  clickWhatsnew(): void {
    this.dialog.open(WhatsnewComponent, {panelClass: 'dialog-container-whatsnew'});
  }

  clickConfig(): void {
    this.ss.appMode = 'config';
  }

  clickSettings(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.ss.cfg = result;
        this.ss.saveConfig();
      }
    });
  }
}
