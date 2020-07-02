import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MapService } from 'src/app/services/map.service';
import { SharedModule } from 'src/app/shared.module';
import { OverviewPage } from './overview.page';

describe('OverviewPage', () => {
  let component: OverviewPage;
  let fixture: ComponentFixture<OverviewPage>;

  const mockMapService = jasmine.createSpyObj('MapService', ['state']);
  mockMapService.state.and.returnValue({
    layers: [],
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OverviewPage],
      imports: [IonicModule.forRoot(), SharedModule],
      providers: [{ provide: MapService, useValue: mockMapService }],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
