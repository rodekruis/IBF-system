import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExportViewComponent } from './export-view.component';

describe('ExportViewComponent', () => {
  let component: ExportViewComponent;
  let fixture: ComponentFixture<ExportViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExportViewComponent],
      imports: [IonicModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
