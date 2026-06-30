import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.scss'
})
export class ComingSoonComponent implements OnInit, OnDestroy {
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  email = '';
  subscribed = false;
  private intervalId: any;
  
  // Date de lancement : dans 30 jours à partir de maintenant (modifiable)
  private launchDate = new Date();
  
  ngOnInit() {
    // Fixer la date de lancement à J+30
    this.launchDate.setDate(this.launchDate.getDate() + 30);
    this.launchDate.setHours(0, 0, 0, 0);
    
    this.startCountdown();
  }
  
  startCountdown() {
    this.intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = this.launchDate.getTime() - now;
      
      if (distance < 0) {
        // Dépassé, on affiche 0
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        if (this.intervalId) clearInterval(this.intervalId);
        return;
      }
      
      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    }, 1000);
  }
  
  onSubscribe() {
    if (this.email && this.email.includes('@')) {
      // Simuler l'envoi - dans la réalité, appelez un service
      console.log('Email enregistré :', this.email);
      this.subscribed = true;
      this.email = '';
      setTimeout(() => this.subscribed = false, 5000);
    } else {
      alert('Veuillez entrer un email valide');
    }
  }
  
  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}