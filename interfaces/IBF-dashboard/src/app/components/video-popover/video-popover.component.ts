import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-video-popover',
  templateUrl: './video-popover.component.html',
  styleUrls: ['./video-popover.component.scss'],
})
export class VideoPopoverComponent {
  public pdfUrl: string;
  public videoUrl: string;
  public safeVideoUrl: SafeResourceUrl;

  constructor(
    private popoverController: PopoverController,
    private domSanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.safeVideoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
      this.videoUrl,
    );
  }

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
