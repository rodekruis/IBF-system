import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageUsersMenuComponent } from 'src/app/components/manage-users-menu/manage-users-menu.component';

describe('ManageUsersMenuComponent', () => {
  let component: ManageUsersMenuComponent;
  let fixture: ComponentFixture<ManageUsersMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageUsersMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageUsersMenuComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
