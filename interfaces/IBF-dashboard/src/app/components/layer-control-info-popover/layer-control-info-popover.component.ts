import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import mockIbfLayer from 'src/app/mocks/ibf-layer.mock';
import { IbfLayer } from 'src/app/types/ibf-layer';

@Component({
  selector: 'app-layer-control-info-popover',
  templateUrl: './layer-control-info-popover.component.html',
  styleUrls: ['./layer-control-info-popover.component.scss'],
  standalone: false,
})
export class LayerControlInfoPopoverComponent {
  public layer: IbfLayer = mockIbfLayer;

  constructor(private popoverController: PopoverController) {}

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
