import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalClientsComponent } from './professional-clients.component';

describe('ProfessionalClientsComponent', () => {
  let component: ProfessionalClientsComponent;
  let fixture: ComponentFixture<ProfessionalClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
