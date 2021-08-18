import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from '@/_services/session.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {log} from '@/_services/logger.service';

@Component({
  selector: 'app-player-grid',
  templateUrl: './player-grid.component.html',
  styleUrls: ['./player-grid.component.scss'],
  animations: [
    trigger('activate',
      [
        state('active', style({
          fontSize: '1em',
          left: '20em'
        })),
        state('inactive', style({
          fontSize: '0.4em',
          left: '135em'
        })),
        transition('inactive <=> active', [animate('1s')])
      ]),
  ]
})
export class PlayerGridComponent implements OnInit {
  @Input()
  player: number;

  constructor(public ss: SessionService) {
  }

  get isActive(): boolean {
    return this.player === this.ss.currentPlayerIdx;
  }

  get classForTable(): string[] {
    const ret = [];
    if (this.ss.currentPlayerIdx >= 0 && this.player !== this.ss.currentPlayerIdx) {
      ret.push('inactive');
    }
    return ret;
  }

  onActivateStart(event: any) {
    this.ss.isAnimating = true;
  }

  onActivateDone(event: any) {
    this.ss.isAnimating = false;
    if (this.player === this.ss.currentPlayerIdx) {
      console.log('feddich und dran ist:', this.ss.players[this.player].name);
      console.log(this.ss);
      this.ss.startRound();
    }
  }

  ngOnInit(): void {
  }

}
