import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewMComponent } from './new.component';

describe('NewComponent', () => {
  let component: NewMComponent;
  let fixture: ComponentFixture<NewMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});