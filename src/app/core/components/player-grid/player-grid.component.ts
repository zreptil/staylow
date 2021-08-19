import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from '@/_services/session.service';
import {animate, state, style, transition, trigger} from '@angular/animations';

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
          fontSize: '0.6em',
          left: '90em',
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
    console.error('onActivateStart', this.ss.players[this.ss.currentPlayerIdx].name, this.isActive);
  }

  onActivateDone(event: any) {
    console.error('onActivateDone', this.ss.players[this.ss.currentPlayerIdx].name, this.isActive);
    setTimeout(() => this.ss.isAnimating = false, 1);
    if (this.isActive) {
      this.ss.startRound();
    }
  }

  ngOnInit(): void {
  }

}
