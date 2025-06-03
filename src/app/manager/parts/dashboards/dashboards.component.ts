import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../service/dashboard.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboards',
  standalone:true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './dashboards.component.html',
  styleUrl: './dashboards.component.scss'
})
export class DashboardsMComponent implements OnInit {
  stats: any = {};
  isLoading = true;
  charts: Chart[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        setTimeout(() => this.initCharts(), 100); // Petit délai pour le rendu
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  initCharts(): void {
    this.destroyCharts(); // Nettoyer les anciens graphiques

    // 1. Ventes mensuelles
    this.createChart('monthlySalesChart', {
      type: 'bar',
      data: {
        labels: this.stats.monthlySales.map((item: any) => item.month),
        datasets: [{
          label: 'Chiffre d\'affaires',
          data: this.stats.monthlySales.map((item: any) => item.amount),
          backgroundColor: 'rgba(59, 130, 246, 0.7)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // 2. Produits les plus vendus
    this.createChart('topProductsChart', {
      type: 'doughnut',
      data: {
        labels: this.stats.topProducts.map((item: any) => item.productname),
        datasets: [{
          data: this.stats.topProducts.map((item: any) => item.sales),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(139, 92, 246, 0.7)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });

    // 3. Tendance du CA
    this.createChart('revenueTrendChart', {
      type: 'line',
      data: {
        labels: this.stats.revenueTrend.map((item: any) => item.date),
        datasets: [{
          label: 'Chiffre d\'affaires',
          data: this.stats.revenueTrend.map((item: any) => item.amount),
          borderColor: 'rgba(16, 185, 129, 0.7)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });

    // 4. Croissance clientèle
    this.createChart('customerGrowthChart', {
      type: 'line',
      data: {
        labels: this.stats.customerGrowth.map((item: any) => item.month),
        datasets: [{
          label: 'Nouveaux clients',
          data: this.stats.customerGrowth.map((item: any) => item.count),
          borderColor: 'rgba(139, 92, 246, 0.7)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  createChart(id: string, config: any): void {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (ctx) {
      this.charts.push(new Chart(ctx, config));
    }
  }

  destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }
}

