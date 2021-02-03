import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { VideoPopoverComponent } from './video-popover.component';

describe('VideoPopoverComponent', () => {
  let component: VideoPopoverComponent;
  let fixture: ComponentFixture<VideoPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VideoPopoverComponent],
      imports: [IonicModule],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
