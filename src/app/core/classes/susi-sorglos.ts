import {OpponentBase} from '@/core/classes/opponent-base';
import {SessionService} from '@/_services/session.service';

export class SusiSorglos extends OpponentBase {

  constructor(public ss: SessionService) {
    super(ss, 'Susi Sorglos');
  }
}
