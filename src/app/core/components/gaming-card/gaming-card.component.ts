import {Component, Input, OnInit} from '@angular/core';
import {CardData} from '@/_models/card-data';
import {SessionService} from '@/_services/session.service';
import {animate, keyframes, style, transition, trigger} from '@angular/animations';
import {log} from '@/_services/logger.service';

@Component({
  selector: 'app-gaming-card',
  templateUrl: './gaming-card.component.html',
  styleUrls: ['./gaming-card.component.scss'],
  animations: [
    trigger('uncover',
      [
        transition('begUncover => midUncover', [animate('0.5s', keyframes([
          style({offset: 0, transform: 'rotate3d(0,0,0,0deg)'}),
          style({offset: 1, transform: 'rotate3d(0,1,0,90deg)'}),
        ]))]),
        transition('midUncover => endUncover', [animate('0.5s', keyframes([
          style({offset: 0, transform: 'rotate3d(0,1,0,90deg)'}),
          style({offset: 1, transform: 'rotate3d(0,0,0,0deg)'}),
        ]))])
      ]),
    trigger('cover',
      [
        transition('begCover => midCover', [animate('0.5s', keyframes([
          style({offset: 0, transform: 'rotate3d(0,0,0,0deg)'}),
          style({offset: 1, transform: 'rotate3d(0,1,0,90deg)'}),
        ]))]),
        transition('midCover => endCover', [animate('0.5s', keyframes([
          style({offset: 0, transform: 'rotate3d(0,1,0,90deg)'}),
          style({offset: 1, transform: 'rotate3d(0,0,0,0deg)'}),
        ]))])
      ]),
  ]
})
export class GamingCardComponent implements OnInit {

  @Input()
  card: CardData;

  constructor(public ss: SessionService) {
  }

  ngOnInit(): void {
  }

  onCardClick(): void {
    this.ss.onCardClick(this.card);
  }

  onUncoverStart(event: any) {
  }

  onUncoverDone(event: any) {
    switch(this.card.animationState) {
      case 'begUncover':
        this.card.animationState = 'midUncover';
        break;
      case 'midUncover':
        this.card.animationState = 'endUncover';
        break;
      case 'endUncover':
        this.card.animationState = '';
        this.card._covered = false;
        break;
    }
  }

  onCoverStart(event: any) {
  }

  onCoverDone(event: any) {
  }
}
