import {Component, OnInit} from '@angular/core';
import {SessionService} from '@/_services/session.service';
import {animate, animateChild, group, query, state, style, transition, trigger} from '@angular/animations';
import {BreakpointObserver} from '@angular/cdk/layout';

@Component({
  selector: 'app-player-grid',
  templateUrl: './player-grid.component.html',
  styleUrls: ['./player-grid.component.scss'],
})
export class PlayerGridComponent implements OnInit {

  constructor(public bpo: BreakpointObserver,
              public ss: SessionService) {
  }

  boardStyle(idx: number): string {
    return `background-image:url("assets/boards/board${this.ss.players[idx].board}.png")`;
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

}
