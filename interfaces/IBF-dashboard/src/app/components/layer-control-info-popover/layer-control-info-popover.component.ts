import { Component, ElementRef, ViewChild } from '@angular/core';
import { PopoverController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TOAST_DURATION, TOAST_POSITION } from 'src/app/config';
import { MOCK_LAYERS } from 'src/app/mocks/ibf-layer.mock';
import { Country, DisasterType } from 'src/app/models/country.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { ApiService } from 'src/app/services/api.service';
import { IbfLayer, IbfLayerType } from 'src/app/types/ibf-layer';
import { downloadFile } from 'src/shared/utils';

@Component({
  selector: 'app-layer-control-info-popover',
  templateUrl: './layer-control-info-popover.component.html',
  standalone: false,
})
export class LayerControlInfoPopoverComponent {
  @ViewChild('uploader', { static: false })
  uploader: ElementRef<HTMLInputElement>;

  public layer: IbfLayer = MOCK_LAYERS[0];
  public ibfLayerTypePoint = IbfLayerType.point;
  public userRole: UserRole;
  public UserRole = UserRole;
  private country: Country;
  private disasterType: DisasterType;

  constructor(
    private popoverController: PopoverController,
    private toastController: ToastController,
    private apiService: ApiService,
    private translateService: TranslateService,
  ) {}

  public closePopover(): void {
    void this.popoverController.dismiss();
  }

  public download() {
    this.apiService
      .getPointData(
        this.country.countryCodeISO3,
        this.layer.name,
        this.disasterType.disasterType,
      )
      .subscribe((content: unknown) => {
        const fileName = `${this.country.countryCodeISO3}-${this.disasterType.disasterType}-${this.layer.name}.geojson`;
        const type = 'application/geo+json';

        downloadFile(fileName, JSON.stringify(content), type);
      });
  }

  public upload() {
    this.uploader.nativeElement.click();
  }

  public onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();

      formData.append('file', file);

      this.apiService
        .postPointData(this.country.countryCodeISO3, this.layer.name, formData)
        .subscribe({
          next: () => {
            window.location.reload();
          },
          error: (error) => {
            const message = this.translateService.instant(
              'layer-control-info-popover.upload-error',
            ) as string;

            console.error(`${message}: ${JSON.stringify(error)}`);

            this.presentToast(message).catch((error: unknown) => {
              console.error(
                `${this.translateService.instant('common.error.present-toast') as string}: ${JSON.stringify(error)}`,
              );
            });
          },
        });
    }
  }

  async presentToast(
    message: string,
    position: 'bottom' | 'middle' | 'top' = TOAST_POSITION,
  ) {
    const toast = await this.toastController.create({
      message,
      duration: TOAST_DURATION,
      position,
    });

    await toast.present();
  }
}
