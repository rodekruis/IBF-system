import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExportViewPopoverComponent } from './export-view-popover.component';

describe('ExportViewPopoverComponent', () => {
  let component: ExportViewPopoverComponent;
  let fixture: ComponentFixture<ExportViewPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExportViewPopoverComponent],
      imports: [IonicModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportViewPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
