import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TyphoonTrackpointPopupContentComponent } from './typhoon-trackpoint-popup-content.component';

describe('TyphoonTrackpointPopupContentComponent', () => {
  let component: TyphoonTrackpointPopupContentComponent;
  let fixture: ComponentFixture<TyphoonTrackpointPopupContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TyphoonTrackpointPopupContentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TyphoonTrackpointPopupContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
