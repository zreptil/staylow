import {Component, Inject} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {Utils} from '@/core/classes/utils';

@Component({
  selector: 'app-image-selector',
  templateUrl: './image-selector.component.html',
  styleUrls: ['./image-selector.component.scss']
})
export class ImageSelectorComponent {
  list: any[];

  constructor(@Inject(MAT_DIALOG_DATA) public listDef: { count?: number, mask?: string, list?: any[] }) {
    if (this.listDef.list != null) {
      this.list = this.listDef.list;
    } else {

      const ret = [];
      for (let i = 1; i <= this.listDef.count; i++) {
        const path = this.listDef.mask.replace(/@idx@/g, Utils.formatNumber(i, 2));
        ret.push({path});
      }
      this.list = ret;
    }
  }

}
