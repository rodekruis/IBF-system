import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { ExportViewPopoverComponent } from 'src/app/components/export-view-popover/export-view-popover.component';

describe('ExportViewPopoverComponent', () => {
  let component: ExportViewPopoverComponent;
  let fixture: ComponentFixture<ExportViewPopoverComponent>;

  beforeEach(waitForAsync(() => {
    addIcons({ 'close-circle': closeCircle });

    TestBed.configureTestingModule({
      declarations: [ExportViewPopoverComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
