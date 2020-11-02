import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { AggregatesComponent } from './aggregates.component';

describe('AggregatesComponent', () => {
  let component: AggregatesComponent;
  let fixture: ComponentFixture<AggregatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AggregatesComponent],
      imports: [IonicModule, HttpClientTestingModule],
      providers: [{ provide: AggregatesService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
