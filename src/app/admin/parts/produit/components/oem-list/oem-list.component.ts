import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-oem-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oem-list.component.html',
})
export class OemListComponent {
  @Input() oem = '';
  @Input() previewLimit = 1;

  showModal = false;

  get oems(): string[] {
    if (!this.oem) return [];

    return this.oem
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  get preview(): string {
    if (this.oems.length === 0) return '-';
    if (this.oems.length <= this.previewLimit) {
      return this.oems.join(', ');
    }

    return `${this.oems[0]} (+${this.oems.length - 1})`;
  }

  openModal(): void {
    if (this.oems.length > 1) {
      this.showModal = true;
    }
  }

  closeModal(): void {
    this.showModal = false;
  }
}