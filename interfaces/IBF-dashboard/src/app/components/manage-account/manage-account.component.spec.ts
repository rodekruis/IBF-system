import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageAccountComponent } from 'src/app/components/manage-account/manage-account.component';

describe('ManageAccountComponent', () => {
  let component: ManageAccountComponent;
  let fixture: ComponentFixture<ManageAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAccountComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageAccountComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
