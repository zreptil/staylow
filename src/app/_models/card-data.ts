export class CardData {
  public animationState = '';
  public _modeAfterAnimation = '';

  public get modeAfterAnimation(): string {
    return this._modeAfterAnimation;
  }

  public set modeAfterAnimation(value: string) {
    console.error('set modeAfterAnimation', value);
    this._modeAfterAnimation = value;
  }

  constructor(private _id: number,
              public _covered: boolean,
              public scope: { type: 'player' | 'drawpile' | 'openpile', param?: any }) {
  }

  get noAnimation(): boolean {
    if (this.animationState.startsWith('beg')
      || this.animationState.startsWith('mid')
      || this.animationState.startsWith('end')) {
      return false;
    }
    return true;
  }

  get coveredState(): boolean {
    switch (this.animationState) {
      case 'begUncover':
      case 'midUncover':
      case 'endCover':
        return true;
      case 'begCover':
      case 'midCover':
      case 'endUncover':
        return false;
    }
    return this._covered;
  }

  get isCovered(): boolean {
    return this._covered;
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
    // 30 - 149 => 1 bis 12
    return Math.floor((this._id - 30) / 10) + 1;
  }

  get cardId(): number {
    return this._id;
  }

  get colorIdx(): number {
    const idx = [0, 0, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
    return idx[this.value + 2];
  }

  uncover(): void {
    if (this._covered) {
      this.animationState = 'begUncover';
    }
  }

  cover(): void {
    if (!this._covered) {
      this.animationState = 'begCover';
    }
  }

  get forLog(): string {
    return `${this._id}${this._covered ? '-' : '+'}${this.scope.type}${this.scope.param}`;
  }

  toString(): string {
    let ret = `${this._id}${this._covered ? '-' : '+'}`;
    while (ret.length < 4) {
      ret = `0${ret}`;
    }
    return ret;
  }
}
