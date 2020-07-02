import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { MapService } from 'src/app/services/map.service';
import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  const mockMapService = jasmine.createSpyObj('MapService', [
    'state',
    'getStations',
  ]);
  mockMapService.state.and.returnValue({
    layers: [],
  });
  mockMapService.getStations.and.returnValue(of([]).toPromise());

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapComponent],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: MapService, useValue: mockMapService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
