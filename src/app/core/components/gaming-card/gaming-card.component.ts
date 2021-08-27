import {Component, Input, OnInit} from '@angular/core';
import {CardData} from '@/_models/card-data';
import {SessionService} from '@/_services/session.service';
import {animate, keyframes, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-gaming-card',
  templateUrl: './gaming-card.component.html',
  styleUrls: ['./gaming-card.component.scss'],
  animations: [
    trigger('uncover',
      [
        transition('begUncover => midUncover', [
          animate(GamingCardComponent.animDuration, keyframes([
            style({offset: 0, transform: 'rotate3d(0,0,0,0deg)'}),
            style({offset: 1, transform: 'rotate3d(0,1,0,90deg)'}),
          ]))]),
        transition('midUncover => endUncover', [
          animate(GamingCardComponent.animDuration, keyframes([
          style({offset: 0, transform: 'rotate3d(0,1,0,90deg)'}),
          style({offset: 1, transform: 'rotate3d(0,0,0,0deg)'}),
        ]))])
      ]),
    trigger('cover',
      [
        transition('begCover => midCover', [
          animate(GamingCardComponent.animDuration, keyframes([
          style({offset: 0, transform: 'rotate3d(0,0,0,0deg)'}),
          style({offset: 1, transform: 'rotate3d(0,1,0,90deg)'}),
        ]))]),
        transition('midCover => endCover', [
          animate(GamingCardComponent.animDuration, keyframes([
          style({offset: 0, transform: 'rotate3d(0,1,0,90deg)'}),
          style({offset: 1, transform: 'rotate3d(0,0,0,0deg)'}),
        ]))])
      ]),
  ]
})
export class GamingCardComponent implements OnInit {
  static animDuration = '0.2s';

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
    switch (this.card?.animationState) {
      case 'begUncover':
        setTimeout(() => this.card.animationState = 'midUncover', 1);
        break;
      case 'midUncover':
        setTimeout(() => this.card.animationState = 'endUncover', 1);
        break;
      case 'endUncover':
        this.card._covered = false;
        this.card.animationState = '';
        const mode = this.card.modeAfterAnimation;
        this.card.modeAfterAnimation = null;
        if (mode != null) {
          if (this.ss.mode !== 'waitafter_endOfGame') {
            this.ss.mode = mode;
          }
        }
        break;
    }
  }

  onCoverStart(event: any) {
  }

  onCoverDone(event: any) {
  }
}
