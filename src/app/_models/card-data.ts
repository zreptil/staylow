export class CardData {
  public coverState = '';
  public showState = '';
  public hideState = '';
  public visible = true;

  constructor(private _id: number,
              public _covered: boolean,
              public scope: { type: 'player' | 'drawpile' | 'openpile', param?: any }) {
  }

  public _modeAfterAnimation = '';
  public dataAfterAnimation = null;

  public get modeAfterAnimation(): string {
    return this._modeAfterAnimation;
  }

  public set modeAfterAnimation(value: string) {
    console.error('set modeAfterAnimation', value);
    this._modeAfterAnimation = value;
  }

  get noAnimation(): boolean {
    if (this.coverState.startsWith('beg')
      || this.coverState.startsWith('mid')
      || this.coverState.startsWith('end')
      || this.hideState.startsWith('beg')
      || this.hideState.startsWith('mid')
      || this.hideState.startsWith('end')
      || this.showState.startsWith('beg')
      || this.showState.startsWith('mid')
      || this.showState.startsWith('end')) {
      return false;
    }
    return true;
  }

  get coveredState(): boolean {
    switch (this.coverState) {
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

  get visibleState(): boolean {
    switch (this.showState) {
      case 'begHide':
      case 'midHide':
      case 'begShow':
      case 'midShow':
      case 'endShow':
        return true;
      case 'endHide':
        return false;
    }
    return this.visible;
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

  uncover(): void {
    if (this._covered) {
      this.coverState = 'begUncover';
    }
  }

  cover(): void {
    if (!this._covered) {
      this.coverState = 'begCover';
    }
  }

  hide(): void {
    if (this.visible) {
      this.hideState = 'begHide';
    }
  }

  show(): void {
    if (!this.visible) {
      this.showState = 'begShow';
      this.visible = true;
    }
  }
}
