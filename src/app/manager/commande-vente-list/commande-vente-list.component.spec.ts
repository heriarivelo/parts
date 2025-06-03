import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeVenteListComponent } from './commande-vente-list.component';

describe('CommandeVenteListComponent', () => {
  let component: CommandeVenteListComponent;
  let fixture: ComponentFixture<CommandeVenteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeVenteListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeVenteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
