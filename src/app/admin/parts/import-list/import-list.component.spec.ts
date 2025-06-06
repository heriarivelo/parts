import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportListComponent } from './import-list.component';

describe('ImportListComponent', () => {
  let component: ImportListComponent;
  let fixture: ComponentFixture<ImportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
