import {Component, OnInit} from '@angular/core';
import {SessionService} from '@/_services/session.service';
import {CardData} from '@/_models/card-data';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {

  constructor(public ss: SessionService) {
  }

  get hiddenStackCard(): CardData {
    return this.ss.hiddenStack[0];
  }

  get openStackCard(): CardData {
    return this.ss.openStack[this.ss.openStack.length - 1];
  }

  ngOnInit(): void {
    this.ss.shuffle();
    this.ss.initPlayers();
  }

  hiddenStackClick(): void {
    if (this.ss.hiddenStack.length > 0) {
      const card = this.ss.getFromStack(this.ss.hiddenStack);
      if (card != null) {
        card.covered = false;
        this.ss.openStack.push(card);
      }
    }
  }
}
