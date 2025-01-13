import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExportViewPopoverComponent } from 'src/app/components/export-view-popover/export-view-popover.component';

describe('ExportViewPopoverComponent', () => {
  let component: ExportViewPopoverComponent;
  let fixture: ComponentFixture<ExportViewPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule, ExportViewPopoverComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportViewPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
