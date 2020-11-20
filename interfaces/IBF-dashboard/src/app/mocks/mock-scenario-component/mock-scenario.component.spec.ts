import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MockScenarioService } from '../mock-scenario-service/mock-scenario.service';
import { MockScenarioComponent } from './mock-scenario.component';

describe('MockScenarioComponent', () => {
  let component: MockScenarioComponent;
  let fixture: ComponentFixture<MockScenarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MockScenarioComponent],
      imports: [IonicModule, HttpClientTestingModule],
      providers: [MockScenarioService],
    }).compileComponents();

    fixture = TestBed.createComponent(MockScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
