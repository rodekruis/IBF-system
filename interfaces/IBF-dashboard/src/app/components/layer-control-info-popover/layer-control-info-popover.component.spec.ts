import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LayerControlInfoPopoverComponent } from './layer-control-info-popover.component';

describe('LayerControlInfoPopoverComponent', () => {
  let component: LayerControlInfoPopoverComponent;
  let fixture: ComponentFixture<LayerControlInfoPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LayerControlInfoPopoverComponent],
      imports: [IonicModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerControlInfoPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
