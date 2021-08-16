import {Utils} from '@/core/classes/utils';

export class CardData {
  constructor(private _id: number, public covered: boolean) {
  }

  get value(): number {
    // 0 - 14 => 0
    if (this._id < 15) {
      return 0;
    }
    // 15 - 24 => -1
    if (this._id < 25) {
      return -1;
    }
    // 25 - 29 => -2
    if (this._id < 30) {
      return -2;
    }
    return Math.floor((this._id - 30) / 10);
  }

  get cardId(): number {
    return this._id;
  }

  get colorIdx(): number {
    const idx = [0, 0, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
    return idx[this.value + 2];
  }

  get className(): string {
    const ret = ['card'];

    if (!this.covered) {
      ret.push(`c${this.colorIdx} v${this.value}`);
      ret.push(`v${this.value}`);
    }

    return Utils.join(ret, ' ');
  }
}
