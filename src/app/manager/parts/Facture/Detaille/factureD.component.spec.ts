import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FactureMDComponent } from './factureD.component';

describe('FactureMDComponent', () => {
  let component: FactureMDComponent;
  let fixture: ComponentFixture<FactureMDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactureMDComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactureMDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
