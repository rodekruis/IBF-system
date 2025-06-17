import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ibf-guide-popover',
  templateUrl: './ibf-guide-popover.component.html',
  styleUrls: ['./ibf-guide-popover.component.scss'],
  standalone: false,
})
export class IbfGuidePopoverComponent implements OnInit {
  public pdfUrl: string;
  public videoUrl: string;
  public safeVideoUrl: SafeResourceUrl;
  public whatsNewUrl: string = environment.whatsNewUrl;
  public videoInsert: string;

  constructor(
    private popoverController: PopoverController,
    private domSanitizer: DomSanitizer,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.safeVideoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
      this.videoUrl,
    );

    this.videoInsert = this.videoUrl
      ? (this.translateService.instant(
          'ibf-guide-component.video-insert',
        ) as string)
      : '';
  }

  public closePopover(): void {
    void this.popoverController.dismiss();
  }
}
