import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AofSummaryComponent } from './aof-summary.component';

describe('AofSummaryComponent', () => {
  let component: AofSummaryComponent;
  let fixture: ComponentFixture<AofSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AofSummaryComponent],
      imports: [IonicModule.forRoot(), HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AofSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
