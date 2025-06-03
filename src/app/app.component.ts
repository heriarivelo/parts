import { Component } from '@angular/core';
import { LayoutComponent } from './layout/layout.component';
// import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent],
  template: `<app-layout></app-layout>`,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'voituredelocation';
}