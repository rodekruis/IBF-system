import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AdminLevelComponent } from './admin-level.component';

describe('AdminLevelComponent', () => {
  let component: AdminLevelComponent;
  let fixture: ComponentFixture<AdminLevelComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AdminLevelComponent],
        imports: [
          IonicModule,
          HttpClientTestingModule,
          RouterTestingModule,
          TranslateModule.forRoot(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(AdminLevelComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
