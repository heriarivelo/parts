import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent {
  @Input() placeholder = 'Rechercher...';
  @Input() value = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  onInput(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
    this.search.emit(value);
  }
}