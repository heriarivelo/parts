import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardsMComponent } from './dashboards.component';

describe('DashboardsMComponent', () => {
  let component: DashboardsMComponent;
  let fixture: ComponentFixture<DashboardsMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardsMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardsMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
