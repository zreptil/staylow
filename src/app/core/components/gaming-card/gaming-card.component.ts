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
          animate(GamingCardComponent.coverDuration, keyframes([
            style({transform: 'rotate3d(0,0,0,0deg)'}),
            style({transform: 'rotate3d(0,1,0,90deg)'}),
          ]))]),
        transition('midUncover => endUncover', [
          animate(GamingCardComponent.coverDuration, keyframes([
            style({transform: 'rotate3d(0,1,0,90deg)'}),
            style({transform: 'rotate3d(0,0,0,0deg)'}),
          ]))])
      ]),
    trigger('cover',
      [
        transition('begCover => midCover', [
          animate(GamingCardComponent.coverDuration, keyframes([
            style({transform: 'rotate3d(0,0,0,0deg)'}),
            style({transform: 'rotate3d(0,1,0,90deg)'}),
          ]))]),
        transition('midCover => endCover', [
          animate(GamingCardComponent.coverDuration, keyframes([
            style({transform: 'rotate3d(0,1,0,90deg)'}),
            style({transform: 'rotate3d(0,0,0,0deg)'}),
          ]))])
      ]),
    trigger('hide',
      [
        transition('begHide => endHide', [
          animate(GamingCardComponent.visibleDuration, keyframes([
            style({opacity: 1.0, transform: 'scale(1)'}),
            style({opacity: 0.0, transform: GamingCardComponent.visibleTransformation}),
          ]))])
      ]),
    trigger('show',
      [
        transition('begShow => endShow', [
          animate(GamingCardComponent.visibleDuration, keyframes([
            style({opacity: 0.0, transform: GamingCardComponent.visibleTransformation}),
            style({opacity: 1.0, transform: 'scale(1)'}),
          ]))])
      ]),
  ]
})
export class GamingCardComponent implements OnInit {
  static coverDuration = '0.2s';
  static visibleDuration = '0.5s';
  static visibleTransformation = 'scale(2) translate(0,-20em)';

  @Input()
  card: CardData;

  constructor(public ss: SessionService) {
  }

  ngOnInit(): void {
  }

  onCardClick(): void {
    this.ss.onCardClick(this.card);
  }

  onAnimationDone(event: any, state: string) {
    switch (state) {
      case 'begUncover':
        setTimeout(() => this.card.coverState = 'midUncover', 1);
        break;
      case 'midUncover':
        setTimeout(() => this.card.coverState = 'endUncover', 1);
        break;
      case 'endUncover':
        this.card._covered = false;
        this.card.coverState = '';
        this.setModeAfterAnimation();
        break;
      case 'begHide':
        setTimeout(() => this.card.hideState = 'endHide', 1);
        break;
      case 'endHide':
        this.card.visible = false;
        this.card.hideState = '';
        this.setModeAfterAnimation();
        break;
      case 'begShow':
        setTimeout(() => this.card.showState = 'endShow', 1);
        break;
      case 'endShow':
        this.card.visible = true;
        this.card.showState = '';
        this.setModeAfterAnimation();
        break;
    }
  }

  setModeAfterAnimation(): void {
    const mode = this.card.modeAfterAnimation;
    this.card.modeAfterAnimation = null;
    if (mode != null) {
      if (this.ss.mode !== 'waitafter_round') {
        this.ss.modeData = this.card.dataAfterAnimation;
        this.ss.mode = mode;
      }
    }
  }

  onCoverStart(event: any) {
  }

  onCoverDone(event: any) {
  }
}
