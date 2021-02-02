import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { AboutBtnComponent } from './about-btn.component';

describe('AboutBtnComponent', () => {
  let component: AboutBtnComponent;
  let fixture: ComponentFixture<AboutBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AboutBtnComponent],
      imports: [IonicModule, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
