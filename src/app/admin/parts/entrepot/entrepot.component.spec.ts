import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntrepotComponent } from './entrepot.component';



describe('EntrepotComponent', () => {
  let component: EntrepotComponent;
  let fixture: ComponentFixture<EntrepotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrepotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntrepotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});