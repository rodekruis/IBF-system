import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SourceInfoModalPage } from './source-info-modal.page';

describe('SourceInfoModalPage', () => {
  let component: SourceInfoModalPage;
  let fixture: ComponentFixture<SourceInfoModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SourceInfoModalPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SourceInfoModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
