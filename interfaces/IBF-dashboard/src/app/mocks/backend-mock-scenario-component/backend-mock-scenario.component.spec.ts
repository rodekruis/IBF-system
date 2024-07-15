import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { BackendMockScenarioComponent } from './backend-mock-scenario.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MockScenarioComponent', () => {
  let component: BackendMockScenarioComponent;
  let fixture: ComponentFixture<BackendMockScenarioComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    declarations: [BackendMockScenarioComponent],
    imports: [IonicModule,
        RouterTestingModule,
        TranslateModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();

      fixture = TestBed.createComponent(BackendMockScenarioComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
