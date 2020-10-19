import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MockDataInterceptor } from './mock-data.interceptor';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MockDataInterceptor,
      multi: true,
    },
  ],
})
export class MockDataModule {}
