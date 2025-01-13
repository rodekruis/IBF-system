import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { IbfButtonComponent } from 'src/app/components/ibf-button/ibf-button.component';

describe('IbfButtonComponent', () => {
  let component: IbfButtonComponent;
  let fixture: ComponentFixture<IbfButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), IbfButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IbfButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
