import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { IbfBuidePopoverComponent } from './ibf-guide-popover.component';

describe('IbfBuidePopoverComponent', () => {
  let component: IbfBuidePopoverComponent;
  let fixture: ComponentFixture<IbfBuidePopoverComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [IbfBuidePopoverComponent],
        imports: [
          IonicModule,
          HttpClientTestingModule,
          TranslateModule.forRoot(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(IbfBuidePopoverComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
