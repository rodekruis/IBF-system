import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypeaheadComponent } from 'src/app/components/typeahead/typeahead.component';

describe('TypeaheadComponent', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TypeaheadComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
