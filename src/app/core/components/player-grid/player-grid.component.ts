import {Component, OnInit} from '@angular/core';
import {SessionService} from '@/_services/session.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {PlayerData} from '@/_models/player-data';
import {MatDialog} from '@angular/material/dialog';
import {Utils} from '@/core/classes/utils';
import {PlayerEditComponent} from '@/core/components/player-edit/player-edit.component';

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
    this.ss._editPlayer = player;
    const dialogRef = this.dialog.open(PlayerEditComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ss.players[idx] = result;
      }
    });
    console.log(player);
  }

  ngOnInit(): void {
    // this.bpo
    //   .observe(['(max-width: 50em)'])
    //   .subscribe((state: BreakpointState) => {
    //     if(state.matches) {
    //       console.log('eng');
    //       PlayerGridComponent.activeStyle = this.activeStyle_vert;
    //       PlayerGridComponent.inactiveStyle = this.inactiveStyle_vert;
    //     } else {
    //       console.log('breit');
    //       PlayerGridComponent.activeStyle = this.activeStyle_horz;
    //       PlayerGridComponent.inactiveStyle = this.inactiveStyle_horz;
    //     }
    //   });
  }

  clickGame(): void {
    this.ss.initGame();
    this.ss.saveConfig();
    this.ss.appMode = 'game';
  }

  clickConfig(): void {
    this.ss.appMode = 'config';
  }
}
