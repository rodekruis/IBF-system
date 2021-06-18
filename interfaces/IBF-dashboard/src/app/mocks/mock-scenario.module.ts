import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BackendMockScenarioComponent } from './backend-mock-scenario-component/backend-mock-scenario.component';

@NgModule({
  declarations: [BackendMockScenarioComponent],
  imports: [CommonModule],
  exports: [BackendMockScenarioComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MockScenarioModule {}
