import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArcticlesMComponent } from './articles.component';

describe('ArcticlesMComponent', () => {
  let component: ArcticlesMComponent;
  let fixture: ComponentFixture<ArcticlesMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArcticlesMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArcticlesMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
