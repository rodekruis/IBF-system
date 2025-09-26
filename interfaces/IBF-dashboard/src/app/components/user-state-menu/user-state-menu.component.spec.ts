import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserStateMenuComponent } from 'src/app/components/user-state-menu/user-state-menu.component';

describe('UserStateMenuComponent', () => {
  let component: UserStateMenuComponent;
  let fixture: ComponentFixture<UserStateMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserStateMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserStateMenuComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
