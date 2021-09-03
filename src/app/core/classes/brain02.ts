import {SessionService} from '@/_services/session.service';
import {CardData} from '@/_models/card-data';
import {Brain01} from '@/core/classes/brain01';

export class Brain02 extends Brain01 {
  public level = 2;

  protected constructor(public ss: SessionService) {
    super(ss);
  }

  static factory(ss: SessionService): Brain02 {
    return new Brain02(ss);
  }

  create(ss: SessionService): Brain02 {
    return Brain02.factory(ss);
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
    if (card?.value > 4 && this.ss.currentCard.value < card?.value) {
      return card;
    }
    card = null;
    if (this.ss.currentCard.scope.type === 'openpile') {
      card = this.selectCoveredCard();
    } else if (this.ss.currentCard.value <= 4) {
      card = this.selectCoveredCard();
    } else {
      card = this.ss.openPile[0];
    }
    return card;
  }
}
