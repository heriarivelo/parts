import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FactureMComponent } from './facture.component';

describe('FactureMComponent', () => {
  let component: FactureMComponent;
  let fixture: ComponentFixture<FactureMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactureMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactureMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
