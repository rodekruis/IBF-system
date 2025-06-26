import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { ExportViewPopoverComponent } from 'src/app/components/export-view-popover/export-view-popover.component';

describe('ExportViewPopoverComponent', () => {
  let component: ExportViewPopoverComponent;
  let fixture: ComponentFixture<ExportViewPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ExportViewPopoverComponent],
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [provideIonicAngular()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportViewPopoverComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
