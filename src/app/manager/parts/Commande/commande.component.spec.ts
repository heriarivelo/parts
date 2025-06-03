import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandeMComponent } from './commande.component';


describe('CommandeMComponent', () => {
  let component: CommandeMComponent;
  let fixture: ComponentFixture<CommandeMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});