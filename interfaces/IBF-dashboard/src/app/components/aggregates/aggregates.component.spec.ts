import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { AggregatesComponent } from './aggregates.component';

describe('AggregatesComponent', () => {
  let component: AggregatesComponent;
  let fixture: ComponentFixture<AggregatesComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AggregatesComponent],
        imports: [IonicModule, HttpClientTestingModule, RouterTestingModule],
        providers: [{ provide: AggregatesService }],
      }).compileComponents();

      fixture = TestBed.createComponent(AggregatesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
