// src/app/pages/dashboard/dashboard.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserReportService } from '../../services/user-report';
import { catchError, finalize, of } from 'rxjs';
import Chart from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';

export interface UserReport {
  userId: number;
  userName: string;
  totalPurchase: number;
  totalSpent: number;
  totalCarbonUsed: number;
  totalCarbonSaved: number;
  ecoBadge: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  private reportSvc = inject(UserReportService);
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private ngZone = inject(NgZone);

  name = localStorage.getItem('name') ?? 'User';
  role = localStorage.getItem('role')?.replace('ROLE_', '') ?? 'GUEST';

  loading = false;
  error: string | null = null;
  report: UserReport | null = null;

  hasPendingRequest = false;
  requesting = false;
  requestSuccess = false;

  hasPendingSellerRequest = false;
  sellerRequesting = false;
  sellerRequestSuccess = false;

  @ViewChild('savedCanvas') savedCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('usedCanvas') usedCanvas?: ElementRef<HTMLCanvasElement>;

  chartSaved?: Chart;
  chartUsed?: Chart;

  isDark = false;
  private themeObserver: MutationObserver | null = null;

  private labels: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private savedData: number[] = [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01];
  private usedData: number[] = [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01];

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  ngOnInit(): void {
  // REMOVE ALL OTHER ROLE CLASSES FIRST
  document.body.classList.remove('user-page', 'admin-page', 'seller-page');

  // APPLY USER PAGE CLASS (for green navbar or user UI)
  document.body.classList.add('user-page');

  // initial theme read
  this.isDark = document.documentElement.classList.contains('dark');

  this.setupThemeObserver();
  this.loadReport();
  this.fetchWeeklyData();

  window.addEventListener('resize', this.handleResize);

}


  // ------------------------------------------------------------
  // After view init — attempt chart init once DOM/CSS have settled
  // ------------------------------------------------------------
  ngAfterViewInit(): void {
    // Small delay helps when component is rendered but CSS/layout still settling.
    // Using setTimeout(0) occasionally fails; 120-200ms is more robust across devices.
    setTimeout(() => {
      requestAnimationFrame(() => {
        setTimeout(() => this.tryInitCharts(true), 60);

      });
    }, 150);
  }

  ngOnDestroy(): void {
    document.body.classList.remove('user-page');
    try { this.chartSaved?.destroy(); } catch { /* ignore */ }
    try { this.chartUsed?.destroy(); } catch { /* ignore */ }
    this.themeObserver?.disconnect();
    window.removeEventListener('resize', this.handleResize);
  }

  // ------------------------------------------------------------
  // LOAD USER REPORT
  // ------------------------------------------------------------
  loadReport() {
    this.loading = true;

    this.reportSvc
      .getReport()
      .pipe(
        catchError(() => {
          this.error = 'Failed to load eco report';
          this.toastr.error(this.error);
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((res: UserReport | null) => {
        if (!res) return;

        // Normalize numeric formatting
        res.totalCarbonUsed = +res.totalCarbonUsed.toFixed(2);
        res.totalCarbonSaved = +res.totalCarbonSaved.toFixed(2);
        res.totalSpent = +res.totalSpent.toFixed(2);

        this.report = res;

        // ensure charts attempt to initialize (force re-create if necessary)
        setTimeout(() => this.tryInitCharts(true), 60);

      });
  }

  // ------------------------------------------------------------
  // WEEKLY DATA
  // ------------------------------------------------------------
  private fetchWeeklyData() {
    this.http.get<any[]>('/api/reports/user/weekly').subscribe({
      next: (data) => {
        const labels = data.map((d) => d.day);
        const saved = data.map((d) => d.saved);
        const used = data.map((d) => d.used);

        this.labels = labels.length ? labels : this.labels;
        this.savedData = saved.length ? saved : this.savedData;
        this.usedData = used.length ? used : this.usedData;

        this.updateCharts();
        this.tryInitCharts();
      },
      error: () => {
        // keep fallbacks & try to render placeholder charts
        this.updateCharts();
        this.tryInitCharts();
      }
    });
  }

  // ------------------------------------------------------------
  // TRY INIT CHARTS (robust — only when canvases exist and layout ready)
  // ------------------------------------------------------------
  private tryInitCharts(force = false) {
    if (!this.savedCanvas || !this.usedCanvas) return;
    if (!this.report) return;

    if (force) {
      try { this.chartSaved?.destroy(); } catch {}
      try { this.chartUsed?.destroy(); } catch {}
      this.chartSaved = undefined;
      this.chartUsed = undefined;
    }

    if (!this.chartSaved && !this.chartUsed) {
      this.ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          this.initCharts();
          this.updateCharts();
        });
      });
    }
  }

  // ------------------------------------------------------------
  // INIT CHARTS (with height check & retry)
  // ------------------------------------------------------------
  private initCharts() {
    if (!this.savedCanvas || !this.usedCanvas) return;

    // canvas offsetHeight can be 0 when hidden or layout not ready.
    const savedHeight = this.savedCanvas.nativeElement.offsetHeight;
    const usedHeight = this.usedCanvas.nativeElement.offsetHeight;

    if (savedHeight === 0 || usedHeight === 0) {
      // retry shortly — layout should be ready after small delay
      setTimeout(() => this.initCharts(), 60);
      return;
    }

    this.chartSaved = this.makeLineChart(
      this.savedCanvas.nativeElement,
      this.labels,
      this.savedData,
      'Carbon Saved (kg)',
      '#10b981'
    );

    this.chartUsed = this.makeLineChart(
      this.usedCanvas.nativeElement,
      this.labels,
      this.usedData,
      'Carbon Used (kg)',
      '#ef4444'
    );
  }

  // ------------------------------------------------------------
  // UPDATE CHARTS
  // ------------------------------------------------------------
  private updateCharts() {
    if (!this.chartSaved || !this.chartUsed) return;

    const savedZero = this.savedData.every((v) => v === 0);
    const usedZero = this.usedData.every((v) => v === 0);

    const maxSaved = savedZero ? 1 : Math.max(...this.savedData) * 1.3;
    const maxUsed = usedZero ? 1 : Math.max(...this.usedData) * 1.3;

    // Saved chart
    this.chartSaved.data.labels = this.labels;
    this.chartSaved.data.datasets[0].data = savedZero ? this.savedData.map(() => 0.01) : this.savedData;
    (this.chartSaved.options.scales!['y'] as any).suggestedMax = maxSaved;
    this.chartSaved.update();

    // Used chart
    this.chartUsed.data.labels = this.labels;
    this.chartUsed.data.datasets[0].data = usedZero ? this.usedData.map(() => 0.01) : this.usedData;
    (this.chartUsed.options.scales!['y'] as any).suggestedMax = maxUsed;
    this.chartUsed.update();
  }

  // ------------------------------------------------------------
  // MAKE LINE CHART (Chart.js)
  // ------------------------------------------------------------
  private makeLineChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    label: string,
    color: string
  ): Chart {
    const ctx = canvas.getContext('2d')!;
    const isDark = this.isDark;

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: color,
            backgroundColor: `${color}33`,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: data.some((v) => v > 0) ? 4 : 0,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        layout: { padding: 8 },
        plugins: {
          legend: {
            display: true,
            labels: { color: isDark ? '#d1d5db' : '#374151' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: isDark ? '#d1d5db' : '#374151' },
            grid: { color: isDark ? '#37415122' : '#00000011' }
          },
          x: {
            ticks: { color: isDark ? '#d1d5db' : '#374151' },
            grid: { color: isDark ? '#37415111' : '#00000008' }
          }
        }
      }
    });
  }

  // ------------------------------------------------------------
  // THEME OBSERVER — rebuild charts when theme (dark/class) changes
  // ------------------------------------------------------------
  private setupThemeObserver() {
    this.themeObserver = new MutationObserver(() => {
      const darkNow = document.documentElement.classList.contains('dark');
      if (darkNow !== this.isDark) {
        this.isDark = darkNow;

        try { this.chartSaved?.destroy(); } catch {}
        try { this.chartUsed?.destroy(); } catch {}
        this.chartSaved = undefined;
        this.chartUsed = undefined;

        // Force a re-init so color tokens and scales are recalculated
        this.tryInitCharts(true);
      }
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  // ------------------------------------------------------------
  // BADGE COLORS
  // ------------------------------------------------------------
  getBadgeColor(): string {
    if (!this.report || this.report.totalCarbonSaved <= 0)
      return 'from-gray-600 to-gray-500';

    const badge = this.report.ecoBadge || '';

    if (badge.includes('Eco Legend')) return 'from-yellow-500 to-amber-500';
    if (badge.includes('Green Hero')) return 'from-green-600 to-green-500';
    if (badge.includes('Conscious Shopper')) return 'from-blue-600 to-blue-500';
    if (badge.includes('Beginner')) return 'from-lime-600 to-lime-500';

    return 'from-gray-500 to-gray-400';
  }

  // ------------------------------------------------------------
  // ADMIN REQUEST
  // ------------------------------------------------------------
  requestAdminAccess() {
    this.requesting = true;

    this.http.post('/api/admin-request/request', {}).subscribe({
      next: () => {
        this.requestSuccess = true;
        this.hasPendingRequest = true;
        this.toastr.success('Admin request sent!');
      },
      error: (err: any) => {
        if (err.status === 409) {
          this.hasPendingRequest = true;
          this.toastr.info(err.error?.message || 'Request already pending');
        } else {
          this.toastr.error('Request failed');
        }
      },
      complete: () => (this.requesting = false)
    });
  }

  // ------------------------------------------------------------
  // SELLER REQUEST
  // ------------------------------------------------------------
  requestSellerAccess() {
    this.sellerRequesting = true;

    this.http.post('/api/seller-request/request', {}).subscribe({
      next: () => {
        this.sellerRequestSuccess = true;
        this.hasPendingSellerRequest = true;
        this.toastr.success('Seller request sent!');
      },
      error: (err) => {
        if (err.status === 400) {
          this.hasPendingSellerRequest = true;
          this.toastr.info(err.error?.message || 'Request already pending');
        } else {
          this.toastr.error('Request failed');
        }
      },
      complete: () => (this.sellerRequesting = false)
    });
  }

  // ------------------------------------------------------------
  // RESIZE HANDLER — re-create charts when viewport changes
  // ------------------------------------------------------------
  private handleResize = () => {
    if (!this.savedCanvas || !this.usedCanvas) return;

    try { this.chartSaved?.destroy(); } catch {}
    try { this.chartUsed?.destroy(); } catch {}
    this.chartSaved = undefined;
    this.chartUsed = undefined;

    // force re-init after resize
    this.tryInitCharts(true);
  };
}
