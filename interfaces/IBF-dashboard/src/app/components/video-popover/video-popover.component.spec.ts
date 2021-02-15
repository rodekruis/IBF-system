import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { VideoPopoverComponent } from './video-popover.component';

describe('VideoPopoverComponent', () => {
  let component: VideoPopoverComponent;
  let fixture: ComponentFixture<VideoPopoverComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [VideoPopoverComponent],
        imports: [IonicModule],
      }).compileComponents();

      fixture = TestBed.createComponent(VideoPopoverComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
