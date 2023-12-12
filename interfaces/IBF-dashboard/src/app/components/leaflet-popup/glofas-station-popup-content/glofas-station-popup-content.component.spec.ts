import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlofasStationPopupContentComponent } from './glofas-station-popup-content.component';

describe('GlofasStationPopupContentComponent', () => {
  let component: GlofasStationPopupContentComponent;
  let fixture: ComponentFixture<GlofasStationPopupContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlofasStationPopupContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlofasStationPopupContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
