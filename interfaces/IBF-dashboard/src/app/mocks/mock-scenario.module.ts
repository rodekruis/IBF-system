import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MockScenarioComponent } from './mock-scenario-component/mock-scenario.component';
import { MockScenarioInterceptor } from './mock-scenario.interceptor';

@NgModule({
  declarations: [MockScenarioComponent],
  imports: [CommonModule],
  exports: [MockScenarioComponent],
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
