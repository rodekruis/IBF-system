import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { ActivationLogButtonComponent } from './activation-log-button.component';

describe('ActivationLogButtonComponent', () => {
  let component: ActivationLogButtonComponent;
  let fixture: ComponentFixture<ActivationLogButtonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ActivationLogButtonComponent],
        imports: [
          IonicModule.forRoot(),
          HttpClientTestingModule,
          RouterTestingModule,
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ActivationLogButtonComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
