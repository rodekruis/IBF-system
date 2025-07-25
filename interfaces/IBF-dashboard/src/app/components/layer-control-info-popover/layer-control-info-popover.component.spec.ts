import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';

describe('LayerControlInfoPopoverComponent', () => {
  let component: LayerControlInfoPopoverComponent;
  let fixture: ComponentFixture<LayerControlInfoPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LayerControlInfoPopoverComponent],
      imports: [IonicModule],
      providers: [provideIonicAngular()],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerControlInfoPopoverComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
