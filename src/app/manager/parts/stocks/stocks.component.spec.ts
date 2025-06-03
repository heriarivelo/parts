import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StocksMComponent } from './stocks.component';

describe('StocksComponent', () => {
  let component: StocksMComponent;
  let fixture: ComponentFixture<StocksMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StocksMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StocksMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
