import {Component, Input, OnInit} from '@angular/core';
import {CardData} from '@/_models/card-data';
import {SessionService} from '@/_services/session.service';

@Component({
  selector: 'app-gaming-card',
  templateUrl: './gaming-card.component.html',
  styleUrls: ['./gaming-card.component.scss']
})
export class GamingCardComponent implements OnInit {

  @Input()
  data: CardData;

  constructor(public ss: SessionService) { }

  ngOnInit(): void {
  }

  onCardClick($event: MouseEvent): void {
    this.data.covered = !this.data.covered;
  }
}
