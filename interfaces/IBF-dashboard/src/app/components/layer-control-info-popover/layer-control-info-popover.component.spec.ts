import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';

describe('LayerControlInfoPopoverComponent', () => {
  let component: LayerControlInfoPopoverComponent;
  let fixture: ComponentFixture<LayerControlInfoPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule, LayerControlInfoPopoverComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerControlInfoPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
