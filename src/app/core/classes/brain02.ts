import {SessionService} from '@/_services/session.service';
import {CardData} from '@/_models/card-data';
import {PlayerData} from '@/_models/player-data';
import {Brain01} from '@/core/classes/brain01';

export class Brain02 extends Brain01 {
  public level = 2;

  constructor(public ss: SessionService) {
    super(ss);
  }

  think_selectPile(): CardData {
    const card = this.ss.openPile[0];
    if (card.value < 5) {
      return card;
    }
    return this.ss.drawPile[0];
  }

  think_placeCard(): CardData {
    let card = this.findHighestCard();
    if (card != null && card.value > 4) {
      return card;
    }
    card = null;
    if (this.ss.currentCard.scope.type === 'openpile') {
      card = this.think_uncoverCard();
    } else {
      card = this.ss.openPile[0];
    }
    return card;
  }
}
