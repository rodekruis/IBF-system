import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MapService } from 'src/app/services/map.service';
import { MatrixComponent } from './matrix.component';

describe('MatrixComponent', () => {
  let component: MatrixComponent;
  let fixture: ComponentFixture<MatrixComponent>;

  const mockMapService = jasmine.createSpyObj('MapService', ['state']);
  mockMapService.state.and.returnValue({
    layers: [],
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MatrixComponent],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: MapService, useValue: mockMapService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
