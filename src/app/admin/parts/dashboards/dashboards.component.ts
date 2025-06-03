import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../service/analytics.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboards.component.html',
  styleUrl: './dashboards.component.scss'
})
export class DashboardsComponent implements OnInit {
  analyticsData: any = {};
  isLoading = true;

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading = true;
    this.analyticsService.getAnalytics().subscribe(
      data => {
        this.analyticsData = data;
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching analytics:', error);
        this.isLoading = false;
      }
    );
  }

}
