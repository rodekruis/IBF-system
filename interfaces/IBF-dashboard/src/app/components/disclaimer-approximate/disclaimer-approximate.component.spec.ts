import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DisclaimerApproximateComponent } from 'src/app/components/disclaimer-approximate/disclaimer-approximate.component';

describe('DisclaimerApproximateComponent', () => {
  let component: DisclaimerApproximateComponent;
  let fixture: ComponentFixture<DisclaimerApproximateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisclaimerApproximateComponent],
      imports: [IonicModule, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DisclaimerApproximateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
