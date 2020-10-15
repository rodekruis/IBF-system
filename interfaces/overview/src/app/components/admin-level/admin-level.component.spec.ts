import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AdminLevelComponent } from './admin-level.component';

describe('AdminLevelComponent', () => {
  let component: AdminLevelComponent;
  let fixture: ComponentFixture<AdminLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminLevelComponent],
      imports: [IonicModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
