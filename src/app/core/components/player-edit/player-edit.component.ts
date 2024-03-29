import {Component} from '@angular/core';
import {SessionService} from '@/_services/session.service';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {ImageSelectorComponent} from '@/core/components/player-edit/image-selector/image-selector.component';
import {PlayerData} from '@/_models/player-data';
import {Utils} from '@/core/classes/utils';
import {OpponentSelectorComponent} from '@/core/components/player-edit/opponent-selector/opponent-selector.component';

@Component({
  selector: 'app-player-edit',
  templateUrl: './player-edit.component.html',
  styleUrls: ['./player-edit.component.scss']
})
export class PlayerEditComponent {
  player: PlayerData;

  constructor(public ss: SessionService,
              public dialog: MatDialog) {
    this.player = ss.editPlayer.clone;
  }

  clickAvatar(): void {
    const dialogRef = this.dialog.open(ImageSelectorComponent, {data: this.ss.avatarList});
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.player.avatar = +result + 1;
      }
    });
  }

  clickBoard(): void {
    const dialogRef = this.dialog.open(ImageSelectorComponent, {data: this.ss.boardList});
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.player.board = +result + 1;
      }
    });
  }

  clickOpponent(): void {
    const list = [];
    for (const opponent of this.ss.opponentDefs) {
      list.push({
        path: this.ss.avatarList.mask.replace(/@idx@/g, Utils.formatNumber(opponent.avatar, 2)),
        name: opponent.name,
        level: opponent.brain(this.ss).level
      });
    }
    const dialogRef = this.dialog.open(OpponentSelectorComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.player = this.ss.createPlayer({opponentIdx: +result});
      }
    });
  }

  changeBrain(): void {
    if (this.player.opponentIdx >= 0) {
      if (this.ss.editPlayer.opponentIdx < 0) {
        this.player = this.ss.editPlayer.clone;
      } else {
        this.player.name = $localize`Spieler`;
        this.player.avatar = 2;
        this.player.board = 2;
        this.player.opponentIdx = -1;
      }
    } else {
      this.player = this.ss.createPlayer({opponentIdx: 0});
    }
  }
}
