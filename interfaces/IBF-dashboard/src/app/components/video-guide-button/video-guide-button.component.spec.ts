import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { VideoGuideButtonComponent } from './video-guide-button.component';

describe('VideoGuideButtonComponent', () => {
  let component: VideoGuideButtonComponent;
  let fixture: ComponentFixture<VideoGuideButtonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [VideoGuideButtonComponent],
        imports: [IonicModule],
      }).compileComponents();

      fixture = TestBed.createComponent(VideoGuideButtonComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
