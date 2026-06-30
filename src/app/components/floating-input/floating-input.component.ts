import { Component, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-floating-input',
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FloatingInputComponent),
      multi: true
    }
  ],
  templateUrl: './floating-input.component.html',
  styleUrl: './floating-input.component.scss'
})
export class FloatingInputComponent implements ControlValueAccessor {
  @Input() id: string = 'floating_' + Math.random().toString(36).substring(2, 9);
  @Input() label: string = 'Label';
  @Input() type: string = 'text';

  value: string = '';
  disabled: boolean = false;

  // Fonctions de callback pour Angular Reactive Forms
  onChange: any = () => {};
  onTouch: any = () => {};

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value); // Informe le formControlName de la modification
    this.onTouch();
  }

  // Méthodes requises par l'interface ControlValueAccessor
  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}