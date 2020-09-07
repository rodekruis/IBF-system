import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { SourceInfoModalPage } from './source-info-modal.page';

const modalSpy = jasmine.createSpyObj('Modal', ['present']);
const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
modalCtrlSpy.create.and.callFake(() => {
  return modalSpy;
});

describe('SourceInfoModalPage', () => {
  let component: SourceInfoModalPage;
  let fixture: ComponentFixture<SourceInfoModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SourceInfoModalPage],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ModalController,
          useValue: modalCtrlSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SourceInfoModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
