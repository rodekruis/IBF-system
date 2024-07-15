import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { IbfGuideButtonComponent } from './ibf-guide-button.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('IbfGuideButtonComponent', () => {
  let component: IbfGuideButtonComponent;
  let fixture: ComponentFixture<IbfGuideButtonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    declarations: [IbfGuideButtonComponent],
    imports: [IonicModule,
        RouterTestingModule,
        TranslateModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();

      fixture = TestBed.createComponent(IbfGuideButtonComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
