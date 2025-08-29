import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { IbfGuidePopoverComponent } from 'src/app/components/ibf-guide-popover/ibf-guide-popover.component';

describe('IbfGuidePopoverComponent', () => {
  let component: IbfGuidePopoverComponent;
  let fixture: ComponentFixture<IbfGuidePopoverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    addIcons({ 'close-circle': closeCircle });

    popoverController = jasmine.createSpyObj<PopoverController>(
      'PopoverController',
      ['dismiss'],
    );

    TestBed.configureTestingModule({
      declarations: [IbfGuidePopoverComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [{ provide: PopoverController, useValue: popoverController }],
    }).compileComponents();

    fixture = TestBed.createComponent(IbfGuidePopoverComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
