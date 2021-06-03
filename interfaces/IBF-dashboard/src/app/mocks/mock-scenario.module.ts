import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BackendMockScenarioComponent } from './backend-mock-scenario-component/backend-mock-scenario.component';
import { MockScenarioComponent } from './mock-scenario-component/mock-scenario.component';
import { MockScenarioInterceptor } from './mock-scenario.interceptor';

@NgModule({
  declarations: [MockScenarioComponent, BackendMockScenarioComponent],
  imports: [CommonModule],
  exports: [MockScenarioComponent, BackendMockScenarioComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MockScenarioInterceptor,
      multi: true,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MockScenarioModule {}
