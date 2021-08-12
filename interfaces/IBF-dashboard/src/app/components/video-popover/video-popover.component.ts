import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PopoverController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-video-popover',
  templateUrl: './video-popover.component.html',
  styleUrls: ['./video-popover.component.scss'],
})
export class VideoPopoverComponent {
  private videoUrl: string = environment.ibfVideoGuideUrl;
  public safeVideoUrl: SafeResourceUrl;

  constructor(
    private popoverController: PopoverController,
    private domSanitizer: DomSanitizer,
  ) {
    this.safeVideoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
      this.videoUrl,
    );
  }

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
