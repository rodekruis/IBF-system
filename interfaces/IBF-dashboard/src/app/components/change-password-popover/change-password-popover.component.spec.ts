import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { ChangePasswordPopoverComponent } from './change-password-popover.component';

describe('ChangePasswordPopoverComponent', () => {
  let component: ChangePasswordPopoverComponent;
  let fixture: ComponentFixture<ChangePasswordPopoverComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ChangePasswordPopoverComponent],
        imports: [
          IonicModule.forRoot(),
          FormsModule,
          HttpClientTestingModule,
          RouterTestingModule,
        ],
        providers: [{ provide: AuthService }],
      }).compileComponents();

      fixture = TestBed.createComponent(ChangePasswordPopoverComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
